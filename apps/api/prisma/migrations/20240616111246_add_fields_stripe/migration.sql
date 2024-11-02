-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_status" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_customer_id" TEXT;
