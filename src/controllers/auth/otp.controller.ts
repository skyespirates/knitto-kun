import { Request, Response } from "express";
import userService from "../../services/user.service";
import otpService from "../../services/otp.service";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/base-response";
import otp from "../../utils/otp";
import { TokenPayload } from "../../types";
import jwt from "../../utils/jwt";

async function request(req: Request, res: Response) {
  const { email } = req.body;

  try {
    const user = await userService.getUserByEmail(email);
    if (user == null) {
      sendErrorResponse(res, "user not found", 401);
      return;
    }

    const userId = user.id;
    const kodeOtp = otp.generate();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await otpService.create(userId, kodeOtp, expiresAt);

    sendSuccessResponse(res, "OTP sent", { otp: kodeOtp });
  } catch (error) {
    sendErrorResponse(res, "failed to generate otp");
  }
}

async function verify(req: Request, res: Response) {
  const { email, otp_code } = req.body;

  try {
    const user = await userService.getUserByEmail(email);
    if (user == null) {
      sendErrorResponse(res, "user not found", 401);
      return;
    }

    const otp = await otpService.check(user.id, otp_code);
    if (otp == null) {
      sendErrorResponse(res, "otp is invalid", 401);
      return;
    }

    await otpService.invalidate(otp.id);

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.generateToken(payload);

    sendSuccessResponse(res, "otp verified successfully", {
      access_token: token,
    });
  } catch (error) {
    sendErrorResponse(res, "failed to verify otp");
  }
}

export default {
  request,
  verify,
};
