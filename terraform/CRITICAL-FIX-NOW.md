# 🚨 CRITICAL: EC2 Authentication Failure - Fix Now

## Problem Identified

Your AWS credentials are **partially working**:
- ✅ STS (Identity) - Working
- ✅ S3 - Working  
- ✅ IAM - Working
- ❌ **EC2 - FAILING** (AuthFailure)

This means your current access key `AKIAQ3EGUNNKS2STUC5N` has **EC2 access revoked or restricted**.

---

## Root Cause

You have multiple access keys:
1. `AKIAQ3EGUNNKRVXF3U5MN` - Exposed publicly (needs deletion)
2. `AKIAQ3EGUNNKS2STUC5N` - Currently in use (EC2 access blocked)

**Likely scenario:** AWS detected suspicious activity and automatically restricted EC2 access on this key.

---

## ⚡ IMMEDIATE FIX (5 minutes)

### Step 1: Delete ALL Old Access Keys

```powershell
# Open IAM Console
Start-Process "https://console.aws.amazon.com/iam/"
```

**In the console:**
1. Click **Users** → **admin** (or root if using root)
2. Go to **Security credentials** tab
3. Find ALL access keys:
   - `AKIAQ3EGUNNKRVXF3U5MN`
   - `AKIAQ3EGUNNKS2STUC5N`
4. For EACH key:
   - Click **Actions** → **Deactivate**
   - Then **Actions** → **Delete**

---

### Step 2: Create Fresh Access Key

**Still in IAM Console:**

1. Click **Create access key**
2. Select **Command Line Interface (CLI)**
3. Check "I understand the above recommendation"
4. Click **Next**
5. (Optional) Add description: "Terraform CLI - March 2026"
6. Click **Create access key**

**IMPORTANT:** Copy BOTH values immediately:
```
Access key ID: AKIA...
Secret access key: ...
```

⚠️ **The secret key is shown ONLY ONCE!**

---

### Step 3: Configure New Credentials

```powershell
# Configure AWS CLI with NEW credentials
aws configure

# When prompted, enter:
# AWS Access Key ID: [paste NEW access key]
# AWS Secret Access Key: [paste NEW secret key]
# Default region name: sa-east-1
# Default output format: json
```

---

### Step 4: Verify Everything Works

```powershell
# Test 1: Identity
aws sts get-caller-identity

# Test 2: EC2 (this was failing before)
aws ec2 describe-regions --region sa-east-1

# Test 3: S3
aws s3 ls

# Test 4: IAM
aws iam list-users
```

**All 4 tests must pass!** ✅

---

### Step 5: Test Terraform

```powershell
cd terraform
terraform plan
```

Should work now! 🎉

---

## 🔐 Security Best Practices

### After fixing, implement these:

#### 1. Enable MFA (Multi-Factor Authentication)

```powershell
Start-Process "https://console.aws.amazon.com/iam/"
```

- Go to **Security credentials**
- Click **Assign MFA device**
- Use Google Authenticator or Authy
- Scan QR code and enter two codes

#### 2. Create IAM User (Don't Use Root!)

**Root account should NEVER be used for daily operations!**

```powershell
# Create admin IAM user
aws iam create-user --user-name terraform-admin

# Attach admin policy
aws iam attach-user-policy `
  --user-name terraform-admin `
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Create access key for new user
aws iam create-access-key --user-name terraform-admin
```

Then configure AWS CLI to use this user instead of root.

#### 3. Set Up AWS Budgets

```powershell
Start-Process "https://console.aws.amazon.com/billing/home#/budgets"
```

Create budget:
- Name: "Monthly Alert"
- Amount: $10 USD
- Alerts at: 50%, 80%, 100%
- Email: mateusalvesbassanelli@gmail.com

#### 4. Enable CloudTrail

```powershell
Start-Process "https://console.aws.amazon.com/cloudtrail/"
```

- Click **Create trail**
- Name: "evolua-audit-trail"
- Enable for all regions
- Store logs in S3

---

## 🎯 Why This Happened

### Possible Reasons:

1. **Exposed Credentials**: You shared `AKIAQ3EGUNNKRVXF3U5MN` publicly
2. **AWS Auto-Protection**: AWS detected suspicious activity and restricted EC2
3. **Multiple Keys**: Having multiple keys increases security risk
4. **Root Account Usage**: Root accounts are high-value targets

### Prevention:

- ✅ Use IAM users, not root
- ✅ Enable MFA
- ✅ Rotate keys every 90 days
- ✅ Never share keys in chat/email
- ✅ Use AWS Secrets Manager for applications
- ✅ Monitor CloudTrail for suspicious activity

---

## 📋 Checklist

Complete these in order:

- [ ] Delete old access key: `AKIAQ3EGUNNKRVXF3U5MN`
- [ ] Delete old access key: `AKIAQ3EGUNNKS2STUC5N`
- [ ] Create new access key
- [ ] Configure AWS CLI with new key
- [ ] Test: `aws sts get-caller-identity`
- [ ] Test: `aws ec2 describe-regions --region sa-east-1`
- [ ] Test: `terraform plan` (should work!)
- [ ] Enable MFA on root account
- [ ] Create IAM admin user
- [ ] Set up AWS Budgets
- [ ] Enable CloudTrail
- [ ] Update terraform.tfvars (if needed)

---

## 🚀 After Fix

Once all tests pass, continue with deployment:

```powershell
cd terraform

# Review what will be created
terraform plan

# Apply infrastructure
terraform apply

# Follow migration guide
# See: MIGRATION-GUIDE.md
```

---

## 🆘 Still Having Issues?

### Error: "AuthFailure" persists

**Solution 1:** Clear AWS CLI cache
```powershell
Remove-Item -Recurse -Force $env:USERPROFILE\.aws\cli\cache -ErrorAction SilentlyContinue
aws configure
```

**Solution 2:** Use environment variables
```powershell
$env:AWS_ACCESS_KEY_ID="YOUR_NEW_KEY"
$env:AWS_SECRET_ACCESS_KEY="YOUR_NEW_SECRET"
$env:AWS_DEFAULT_REGION="sa-east-1"

terraform plan
```

**Solution 3:** Check IAM permissions
```powershell
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

### Error: "You are not authorized"

Your IAM user needs these policies:
- `AmazonEC2FullAccess`
- `AmazonRoute53FullAccess`
- `CloudWatchFullAccess`
- `AmazonSNSFullAccess`
- `AmazonVPCReadOnlyAccess`

Add them in IAM Console → Users → Your user → Permissions

---

## 📞 AWS Support

If you see unexpected charges or suspicious activity:

1. Open AWS Console: https://console.aws.amazon.com/support/
2. Click **Create case**
3. Select **Account and billing support**
4. Explain:
   - "Credentials were exposed on [date]"
   - "Requesting review of charges"
   - "Already revoked compromised keys"

AWS is usually helpful with fraudulent charges from compromised keys.

---

## ⏱️ Time Estimate

- Delete old keys: 2 minutes
- Create new key: 1 minute
- Configure AWS CLI: 1 minute
- Test: 1 minute
- **Total: ~5 minutes**

---

**Priority:** 🚨 CRITICAL - Do this NOW before continuing

**Last Updated:** March 9, 2026
