import type { Testimonial } from "@/types";

export default function TestimonialCard({
  name,
  role,
  avatarUrl,
  quote,
}: Testimonial) {
  return (
    <div className="bg-surface-light p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          {avatarUrl ? (
            <img
              alt={`Foto de ${name}`}
              className="w-full h-full object-cover"
              src={avatarUrl}
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-xs text-text-secondary-light">{role}</p>
        </div>
      </div>
      <p className="text-text-secondary-light text-sm italic">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
