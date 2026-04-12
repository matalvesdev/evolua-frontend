'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useFinancialStats, useTransactions } from '@/hooks';

const NAV_TABS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/pacientes', label: 'Pacientes' },
  { href: '/dashboard/agendamentos', label: 'Agenda' },
  { href: '/dashboard/financeiro', label: 'Financeiro' },
  { href: '/dashboard/relatorios', label: 'Relatórios' },
  { href: '/dashboard/configuracoes', label: 'Configurações' },
];

export default function FinanceiroPage() {
  const pathname = usePathname();
  const { stats, loading: statsLoading } = useFinancialStats();
  const { transactions, loading: transactionsLoading } = useTransactions();

  const loading = statsLoading || transactionsLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };

    const labels: Record<string, string> = {
      pending: 'Pendente',
      completed: 'Pago',
      overdue: 'Atrasado',
      cancelled: 'Cancelado',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <>
      <DashboardHeader />

      {/* Navigation tabs */}
      <nav className="hidden md:block bg-transparent mb-8 px-6 lg:px-10">
        <div className="flex items-center justify-start lg:justify-center gap-4 lg:gap-8 overflow-x-auto pb-2 no-scrollbar">
          {NAV_TABS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#8A05BE] text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-[#8A05BE] hover:border-[#8A05BE]/30'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financeiro</h1>
              <p className="text-gray-600 mt-1">Acompanhe sua saúde financeira e transações</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Saldo Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats?.balance || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Receitas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats?.totalIncome || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Despesas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(stats?.totalExpense || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-100">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pendente</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(0)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-100">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl">Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Carregando...</div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhuma transação encontrada</p>
                  <p className="text-sm text-muted-foreground">
                    Comece adicionando suas receitas e despesas
                  </p>
                </div>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`p-3 rounded-xl ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {transaction.description || transaction.category}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {formatDate(transaction.dueDate ?? transaction.createdAt)} •{' '}
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 w-full lg:w-auto">
                        {getStatusBadge(transaction.status)}
                        <p
                          className={`text-base sm:text-lg font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
