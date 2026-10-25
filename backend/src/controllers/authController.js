// Removed verifyEmail controller
// exports.verifyEmail = async (req, res) => {
//   const { email, code } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     if (user.verificationCode !== code) {
//       return res.status(400).json({ message: 'Invalid verification code' });
//     }
//     user.isVerified = true;
//     user.verificationCode = undefined;
//     await user.save();
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.json({ token, user: { id: user._id, email: user.email } });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// }; 