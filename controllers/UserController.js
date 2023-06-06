const {
	registerValidationSchema,
	loginValidationSchema,
	userVerificationSchema,
	updateProfileSchema,
} = require("../validation/UserValidation");
const UserService = require("../services/UserService");
const UserModel = require("../models/UserModel");
const jwtsecret = process.env.JWTSECRET;
const jwt = require("jsonwebtoken");

class UserController {
	//post
	registerUser = async (req, res) => {
		const { error } = registerValidationSchema.validate(req.body);
		if (error) {
			const errorMsg = error.details[0].message;
			res.send({ msg: errorMsg, success: false });
		} else {
			try {
				const { email, username, phoneNumber } = req.body;
				const userByUsername = await UserModel.findOne({ username });
				const userByEmail = await UserModel.findOne({ email });
				const userByPhoneNumber = await UserModel.findOne({ phoneNumber });

				if (userByUsername)
					return res.send({
						msg: `Username ${username} isn't available`,
						success: false,
					});
				if (userByEmail)
					return res.send({
						msg: `Email ${email} already in use`,
						success: false,
					});
				if (userByPhoneNumber)
					return res.send({
						msg: `Phone number ${phoneNumber} is already in use`,
						success: false,
					});
				const createdUser = await UserService.createUser(req.body);
				if (createdUser) {
					const { userId, email: Email, firstname, lastname } = createdUser;
					jwt.sign(
						{ username, Email, firstname, lastname, userId },
						jwtsecret,
						(err, token) => {
							if (err) throw err;
							res.send({
								msg: "User created successfully",
								token: token,
								success: true,
							});
						}
					);
				} else {
					res.send({
						msg: "Couldn't create account",
						success: false,
					});
				}
			} catch (error) {
				res.send("Couldn't create account");
				console.log(error);
			}
		}
	};
	//post
	loginUser = async (req, res) => {
		const { error } = loginValidationSchema.validate(req.body);
		if (error) {
			res.send({ msg: error.details[0].message, success: false });
		} else {
			try {
				const { username } = req.body;
				const userByUsername = await UserModel.findOne({ username: username });
				if (userByUsername) {
					const loggedInUser = await UserService.loginUser(req.body);
					if (loggedInUser) {
						const { userId, email, firstname, lastname } = loggedInUser;
						jwt.sign(
							{ username, email, firstname, lastname, userId },
							jwtsecret,
							(err, token) => {
								if (err) throw err;
								res.send({
									msg: "user logged in",
									token: token,
									success: true,
								});
							}
						);
					} else {
						res.send({ msg: "Incorrect password" });
					}
				} else {
					return res.send({
						msg: "User not found \n Please create an account",
					});
				}
			} catch (error) {
				res.send(error);
				console.log(error);
			}
		}
	};
	//post
	verifyUser = async (req, res) => {
		const { error } = userVerificationSchema.validate(req.body);
		if (error) {
			res.send({ msg: error.details[0].message, success: false });
		} else {
			try {
				const { userId, password } = req.body;
				const User = await UserService.verfiyUser(userId, password);
				if (!User) res.send({ msg: "Incorrect Password", success: false });
				if (User) res.send({ msg: "User verified", success: true });
			} catch (error) {
				res.send({ msg: "Something went wrong", success: false });
				console.log(error);
			}
		}
	};
	//put
	updateUser = async (req, res) => {
		const { error } = updateProfileSchema.validate(req.body);
		if (error) {
			res.send({ msg: error.details[0].message, success: false });
		} else {
			try {
				const updatedProfile = await UserService.updateUser(req.body);
				{
					updatedProfile
						? res.send({ msg: "profile updated successfully", success: true })
						: res.send({ msg: "Couldn't update profile", success: false });
				}
			} catch (error) {
				res.send({ msg: "Something went wrong", success: false });
				console.error(error);
			}
		}
	};
	//delete
	deleteUser = async (req, res) => {
		try {
			const { userId } = req.params;

			const deletedUser = await UserService.deleteUser(userId);
			{
				deletedUser
					? res.send({ msg: "Account deleted successfully", success: true })
					: res.send({ msg: "Could not delete account", success: false });
			}
		} catch (error) {
			res.send({ msg: "Something went wrong", success: false });
		}
	};

	//get
	viewProfile = async (req, res) => {
		try {
			let { userId } = req.params;
			userId = userId.trim();
			const userData = await UserService.getUserById(userId);
			{
				userData
					? res.send({ msg: "User info ", userData: userData })
					: res.send({ msg: "Cannot view Profile" });
			}
		} catch (error) {
			res.send({ msg: "Something went wrong", success: false });
		}
	};
	//get
	fetchFriends = async (req, res) => {
		try {
			const { userId } = req.params;

			const friendList = await UserService.getUserFriends(userId);
			{
				friendList
					? res.send({ data: friendList })
					: res.send({ msg: "Could not find friends" });
			}
		} catch (error) {
			res.send({ msg: "Something went wrong", success: false });
		}
	};
	//get
	fetchPendingRequests = async (req, res) => {};
	//post
	acceptRequest = async (req, res) => {};
	//post
	logoutUser = async (req, res) => {};
}
module.exports = new UserController();
