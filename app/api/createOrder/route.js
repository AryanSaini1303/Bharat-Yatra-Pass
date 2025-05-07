import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const totalAmount = body.totalAmount;
    const order = await new Promise((resolve, reject) => {
      razorpay.orders.create(
        {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "receipt_" + Math.random().toString(36).substring(7),
          payment_capture: 1,
        },
        (err, order) => {
          if (err) reject(err);
          else resolve(order);
        }
      );
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}
