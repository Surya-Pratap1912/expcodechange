
//                            integrating payments

document.getElementById("buy").onclick = async function (e) {
    console.log("I'm buying now");
  
    try {
      // Send an asynchronous GET request to retrieve premium membership information from the specified URL
      const response = await axios.get(
        "http://localhost:10000/purhase/premuiumMembership",
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Prepare options for handling the payment response
      // Set the key and order ID for the payment
  
      var options = {
        key: response.data.key_id,
        order_id: response.data.order.id,
  
        // Define a handler function for successful payment
        handler: async function (response) {
          const data1 = await axios.post(
            "http://localhost:10000/purchase/updatetransectionstatus",
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
  
      // Create a new Razorpay instance with the defined options and open the payment dialog
      const razor = new Razorpay(options);
      razor.open();
  
      e.preventDefault();
  
      // Define a handler for the "payment.failed" event
      razor.on("payment.failed", async function (response) {
        await axios.post(
          "http://localhost:10000/purchase/updatetransectionstatus",
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
  