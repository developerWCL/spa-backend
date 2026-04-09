import { Injectable, BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

export interface GoogleUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

@Injectable()
export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('GoogleOAuthService');
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Verify Google ID Token received from NextAuth on frontend
   * @param idToken - The ID token from Google
   * @returns User information extracted from token
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    this.logger.log('Verifying Google ID token');
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        this.logger.error('Invalid Google ID token', null);
        throw new BadRequestException('Invalid Google ID token');
      }

      this.logger.log('Google ID token verified successfully', {
        email: payload.email,
      });
      return {
        id: payload.sub,
        email: payload.email || '',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        profilePicture: payload.picture,
      };
    } catch (error) {
      this.logger.error('Failed to verify Google token', error);
      throw new BadRequestException(
        `Failed to verify Google token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Alternative: Accept user info directly from NextAuth
   * Useful if NextAuth frontend already verified the token
   * @param googleUserInfo - User info from NextAuth
   * @returns Validated user information
   */
  validateGoogleUserInfo(googleUserInfo: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }): GoogleUserInfo {
    if (!googleUserInfo.id || !googleUserInfo.email) {
      throw new BadRequestException('Missing required Google user information');
    }

    return {
      id: googleUserInfo.id,
      email: googleUserInfo.email.toLowerCase(),
      firstName: googleUserInfo.firstName || '',
      lastName: googleUserInfo.lastName || '',
      profilePicture: googleUserInfo.profilePicture,
    };
  }
}
