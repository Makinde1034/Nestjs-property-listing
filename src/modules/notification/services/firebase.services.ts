// import { ConfigService } from '@nestjs/config';
// import {
//   FireBaseConfig,
//   getFireBaseConfigName,
// } from '../../../config/firebase.config';
// import { Injectable, Logger } from '@nestjs/common';
// import { PushNotificationPayload } from '../../../common/interface';
// import { SuccessResponse } from '../../../common/utils/success.response';

// import * as firebase from 'firebase-admin';
// import { NotificationTokenRepository } from '../repositories/notification-token.repository';

// @Injectable()
// export class FireBaseService {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly notificationTokenRepository: NotificationTokenRepository,
//   ) {
//     const config = this.configService.get<FireBaseConfig>(
//       getFireBaseConfigName(),
//     );

//     firebase.initializeApp({
//       credential: firebase.credential.cert({
//         projectId: config.projectId,
//         clientEmail: config.email,
//         privateKey: config.key,
//       }),
//     });
//   }
//   logger = new Logger(FireBaseService.name);

//   /********
//    * notification token service(update , create)
//    *
//    * notification service(calls the firebase service and others)
//    *
//    * firebase service
//    *
//    *
//    ********/

//   /**
//    * Update User Profile
//    *
//    * @async
//    * @param {PushNotificationPayload} notification
//    * @returns {Promise<void>}
//    */

//   async sendPushNotification(notification: PushNotificationPayload) {
//     const userPreference = await this.notificationTokenRepository.findOne({
//       where: { userId: notification.userId },
//     });

//     if (userPreference.enabledNotifications) {
//       const androidConfig: firebase.messaging.AndroidConfig = {
//         priority: 'high',
//       };
//       const data = {
//         title: notification.title,
//         message: notification.message,
//         userId: notification.userId,
//         deepLink: notification.redirectLink,
//       };
//       const message: firebase.messaging.Message = {
//         token: notification.notificationToken,
//         data,
//         android: androidConfig,
//         apns: {
//           payload: {
//             aps: {
//               alert: {
//                 title: notification.title,
//                 body: notification.message,
//               },
//               sound: 'default',
//               badge: 1,
//             },
//           },
//         },
//         webpush: {
//           data,
//           fcmOptions: {
//             link: notification.redirectLink,
//           },
//         },
//       };
//       await firebase
//         .messaging()
//         .send(message)
//         .then((response) => {
//           this.logger.log('Successfully sent message:', response);
//         })
//         .catch((error) => {
//           this.logger.debug('error code:', error.code);

//           this.logger.debug('Error sending notification:', error);
//         });

//       const fcmToken = await this.findById(notification.userId);

//       if (fcmToken.deviceType == notification.device_type) {
//         await this.update({
//           id: fcmToken.id,
//           device_type: notification.device_type,
//           token: notification.notificationToken,
//         });
//       }
//       return new SuccessResponse('push notification sent');
//     }
//   }

//   async configureNotification(notification: PushNotificationPayload) {
//     const androidConfig: firebase.messaging.AndroidConfig = {
//       priority: 'high',
//     };
//     const data = {
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       deepLink: notification.redirectLink,
//     };
//     const message: firebase.messaging.Message = {
//       token: notification.notificationToken,
//       data,
//       android: androidConfig,
//       apns: {
//         payload: {
//           aps: {
//             alert: {
//               title: notification.title,
//               body: notification.message,
//             },
//             sound: 'default',
//             badge: 1,
//           },
//         },
//       },
//       webpush: {
//         data,
//         fcmOptions: {
//           link: notification.redirectLink,
//         },
//       },
//     };

//     await firebase
//       .messaging()
//       .send(message)
//       .then((response) => {
//         this.logger.log('Successfully sent message:', response);
//       })
//       .catch((error) => {
//         this.logger.debug('error code:', error.code);

//         this.logger.debug('Error sending notification:', error);
//       });

//     const fcmToken = await this.findById(notification.userId);

//     if (fcmToken.deviceType == notification.device_type) {
//       await this.update({
//         id: fcmToken.id,
//         device_type: notification.device_type,
//         token: notification.notificationToken,
//       });
//     }
//     return new SuccessResponse('push notification sent');
//   }
// }
