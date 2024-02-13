//                            integrating payments

document.getElementById("buy").onclick = async function (e) {
  console.log("I'm buying now");

  try {
    const response = await axios.get(
      "http://54.226.18.204:11000/purhase/premuiumMembership",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    var options = {
      key: response.data.key_id,
      order_id: response.data.order.id,

      handler: async function (response) {
        const data1 = await axios.post(
          "http://54.226.18.204:11000/purchase/updatetransectionstatus",
          {
            status: "SUCCESSFUL",
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("purchase response >> ", response);
        console.log("data1 >> ", data1);

        alert("yeah! you are a premium member");
        location.reload();
      },
    };

    const razor = new Razorpay(options);
    razor.open();
    e.preventDefault();
    razor.on("payment.failed", async function (response) {
      await axios.post(
        "http://54.226.18.204:11000/purchase/updatetransectionstatus",
        {
          status: "failed",
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );
    });
  } catch (err) {
    console.log(err.message);
  }
};
