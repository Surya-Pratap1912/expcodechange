exports.addExpanse = async function (req, res, next) {
    const t = await sequelize.transaction();
    const { amt, des, cat } = req.body;

    try {
        await req.user.update({ totalExpanse: req.user.totalExpanse + +amt }, { transaction: t });

        const expanseResult = await req.user.createExpanse(
            {
                amt: amt,
                des: des,
                cat: cat,
            },
            { transaction: t }
        );

        // You should not commit the transaction here, as it will make the transaction object unusable for subsequent operations
        // await t.commit();

        const obj = {
            amt,
            des,
            cat
        };

        res.json(obj);
        t.commit(); // put it in all promises and then in the ending of try block commit it
    } catch (err) {
        console.log("error in catch 1 ", err);
        await t.rollback();

        res.status(500).json({ error: 'An error occurred while adding the expense.' });
    } finally {
        // Make sure to commit or rollback the transaction outside of the try-catch block
        if (t.finished !== 'commit') {
            // Check if the transaction was not already committed
            await t.rollback();
        }
    }
};


ca82knoowqen38kb8wnd030jnode48ln42b8xjdk93

exports.deleteExpanse = async (req, res, next) => {
    const t = sequelize.transaction();
  
    const prodId = req.params.prodId;
    // console.log(req.params.prodId);
    try {
      Expanse.findByPk(prodId)
        .then(async (data) => {
          User.findByPk(data.userId).then(async (user) => {
            // console.log("user >>  ", user);
            user.update(
              { totalExpanse: user.totalExpanse - +data.amt },
              { transaction: t }
            );
          });
  
          return data.destroy({ transaction: t });
        })
        .then(() => {
          console.log("destroyed data");
          res.send("deleted successfully");
        });
      // .catch((err) => {
      //   console.log(err);
      // });
      t.commit();
    } catch (err) {
      console.log("error ccaught in deleteExpanse catch ", err);
      t.rollback();
    }
    // res.send(`<h1>delete....</h1>`);
  };
  