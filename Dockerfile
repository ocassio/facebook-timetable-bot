FROM node:alpine

RUN mkdir /facebook-timetable-bot
WORKDIR /facebook-timetable-bot
ADD . .

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]