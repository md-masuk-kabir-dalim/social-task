import config from "../../config";
import { hashPassword } from "../../utils/passwordHelpers";
import { UserModel, UserRole } from "../modules/User/user.model";

export const initiateSuperAdmin = async () => {
  const payload = {
    fullName: "Super",
    email: config.password.admin_email,
    phoneNo: "+1234567890",
    password: config.password.superadmin_password,
    role: UserRole.ADMIN,
    isVerified: true,
  };

  // Check if  Admin already exists
  const existingSuperAdmin = await UserModel.findOne({ email: payload.email });
  if (existingSuperAdmin) return;

  if (!payload.password) return;

  const hashedPassword = await hashPassword(payload.password);

  // Create  Admin user
  const user = await UserModel.create({
    fullName: payload.fullName,
    email: payload.email,
    phoneNo: payload.phoneNo,
    password: hashedPassword,
    role: payload.role,
    isVerified: payload.isVerified,
  });

  console.log("✅ Super Admin initialized successfully");
};
