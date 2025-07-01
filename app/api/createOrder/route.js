import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const totalAmount = body.totalAmount;
    const vendorAmount = body.vendorAmount;
    const adminAmount = body.adminAmount;
    const vendorAccount = body.account;
    const order = await new Promise((resolve, reject) => {
      razorpay.orders.create(
        {
          amount: totalAmount * 100,
          currency: 'INR',
          receipt: `bypr-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 6)}`,
          payment_capture: 1,
          transfers: [
            // transfers array only have the account of vendors not the main admin account that owns the razorpay account/api key, the left over amount from the total balance after tranfers is sent to main account current balance and from that the fees is deducted, NEVER INCLUDE THE MAIN ACCOUNT IN TRANSFERS ELSE FEES WILL BE DEDUCTED FROM THE MAIN ACCOUNT WITHOUT EVEN GETTING THE SHARE.
            // {
            //   account: 'acc_Qm72RBahwBeLhB', // perimeter network pvt. ltd.
            //   amount: adminAmount * 100,
            //   currency: 'INR',
            //   notes: { role: 'main' },
            // },
            {
              account: vendorAccount, // vendor account
              amount: vendorAmount * 100,
              currency: 'INR',
              notes: { role: 'vendor' },
            },
          ],
        },
        (err, order) => {
          if (err) reject(err);
          else resolve(order);
        },
      );
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 },
    );
  }
}
