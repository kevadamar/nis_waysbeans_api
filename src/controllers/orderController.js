exports.checkout = async (req, res) => {
  console.log(req.body);
  res.json({
    data: req.body,
  });
};
