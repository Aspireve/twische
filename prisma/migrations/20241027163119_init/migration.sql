-- CreateTable
CREATE TABLE "Tweets" (
    "id" SERIAL NOT NULL,
    "tweet" TEXT NOT NULL,
    "postedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "posted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tweets_pkey" PRIMARY KEY ("id")
);
