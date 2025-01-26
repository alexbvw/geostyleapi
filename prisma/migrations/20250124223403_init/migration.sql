-- CREATE EXTENSION postgis;
-- CreateTable
CREATE TABLE "Article" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "spot_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published_at" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "spot_id" UUID NOT NULL,
    "image_url" TEXT,
    "service_name" TEXT NOT NULL,
    "estimate_hours" INTEGER NOT NULL,
    "amount_per_hour" INTEGER NOT NULL,
    "service_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "spot_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_description" TEXT,
    "product_category" TEXT,
    "image_url" TEXT,
    "price" INTEGER NOT NULL,
    "stock_count" INTEGER NOT NULL,
    "in_stock" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "spot_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "status" TEXT,
    "total" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "spot_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "status" TEXT,
    "payment_option" TEXT,
    "payment_status" BOOLEAN,
    "line_item_count" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "booking_ids" TEXT[],
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeslot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "spot_id" UUID NOT NULL,
    "day_name" TEXT,
    "date" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "available" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Timeslot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "spot_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "total_hours" INTEGER,
    "customer_id" UUID NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT NOT NULL,
    "status" TEXT,
    "review" TEXT NOT NULL,
    "time_slot_ids" TEXT[],
    "service_ids" TEXT[],
    "stylist_ids" TEXT[],
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "radius" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "images" TEXT[],
    "active" BOOLEAN NOT NULL,
    "address" TEXT NOT NULL,
    "admin_id" UUID NOT NULL,
    "open_hour" TEXT,
    "close_hour" TEXT,
    "stylist_ids" TEXT[],
    "customer_ids" TEXT[],
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Spot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "radius" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "pin_code" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "order_ids" TEXT[],
    "current_address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stylist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "radius" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "pin_code" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "current_address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Stylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "radius" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "pin_code" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "current_address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chatroom" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "customer_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Chatroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "message_status" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_sender" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Article_id_title_published_at_idx" ON "Article"("id", "title", "published_at");

-- CreateIndex
CREATE INDEX "Service_id_service_name_idx" ON "Service"("id", "service_name");

-- CreateIndex
CREATE INDEX "Product_id_product_name_idx" ON "Product"("id", "product_name");

-- CreateIndex
CREATE INDEX "Payment_id_customer_id_idx" ON "Payment"("id", "customer_id");

-- CreateIndex
CREATE INDEX "Order_id_idx" ON "Order"("id");

-- CreateIndex
CREATE INDEX "OrderItem_id_order_id_idx" ON "OrderItem"("id", "order_id");

-- CreateIndex
CREATE INDEX "Timeslot_id_day_name_date_start_time_end_time_available_idx" ON "Timeslot"("id", "day_name", "date", "start_time", "end_time", "available");

-- CreateIndex
CREATE INDEX "Booking_id_service_ids_idx" ON "Booking"("id", "service_ids");

-- CreateIndex
CREATE INDEX "Spot_id_name_admin_id_stylist_ids_idx" ON "Spot"("id", "name", "admin_id", "stylist_ids");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_name_key" ON "Customer"("name" ASC);

-- CreateIndex
CREATE INDEX "Customer_id_name_phone_number_idx" ON "Customer"("id", "name", "phone_number");

-- CreateIndex
CREATE INDEX "Stylist_id_name_phone_number_idx" ON "Stylist"("id", "name", "phone_number");

-- CreateIndex
CREATE INDEX "Admin_id_name_phone_number_idx" ON "Admin"("id", "name", "phone_number");

-- CreateIndex
CREATE INDEX "Chatroom_id_customer_id_admin_id_idx" ON "Chatroom"("id", "customer_id", "admin_id");

-- CreateIndex
CREATE INDEX "Message_customer_id_admin_id_idx" ON "Message"("customer_id", "admin_id");
