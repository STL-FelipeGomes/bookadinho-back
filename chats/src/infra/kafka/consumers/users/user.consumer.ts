import { kafkaConsumer } from './kafka.consumer.js';
import { UserUsecase } from '../../../../modules/users/user.usecase.js';

type UserConsumer = {
  action: string;
  body: {
    id: string;
  };
};

export async function userKafkaConsumer() {
  const userUsecase = new UserUsecase();
  const consumer = await kafkaConsumer('users');
  await consumer.run({
    eachMessage: async ({ message }) => {
      const messageToString = message.value!.toString();
      const userConsumer: UserConsumer = JSON.parse(messageToString);
      switch (userConsumer.action) {
        case 'create':
          try {
            await userUsecase.createUser(userConsumer.body.id);
          } catch (error) {
            console.debug('\x1b[31m[ERROR CREATEUSER]\x1b[0m');
          }
          break;
        case 'delete':
          try {
            await userUsecase.deleteUser(userConsumer.body.id);
          } catch (error) {
            console.debug('\x1b[31m[ERROR DELETEUSER]\x1b[0m');
          }
          break;
        default:
          console.debug('\x1b[31m[RECEIVED MESSAGE AND NOT FOUND ACTION]\x1b[0m');
      }
    },
  });
}

userKafkaConsumer();
