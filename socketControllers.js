const User = require("../models/users");
const sequelize = require("../database");
const Group = require("../models/groups");
const chatAppControllers = require("./chatAppControllers");
const S3Services = require("../services/s3services");
const multer = require("multer");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

let USERS = new Map();

const joinMe = async (userName) => {
  try {
    const user = await User.findOne({ userName: userName });

    if (user) {
      const groups = await user.groups;
      return groups;
    } else {
      console.log("User not found");
      return [];
    }
  } catch (error) {
    console.log("Error in joinMe:", error);
    throw error;
  }
};

const sockets = (io) => {
  io.on("connection", (socket) => {
    console.log("");
    console.log("");
    console.log("");
    USERS.set("");
    socket.emit("connected", { messege: "connected" });
    socket.on("connected", async ({ user }) => {
      // console.log('usered',user);
      USERS.set(user, socket.id);
      console.log(user,'connected', socket.id);

      const groups = await joinMe(user);
      groups.forEach((group) => {
        socket.join(group.groupName);
      });
    });

    socket.on("group-created", (user, group) => {
      socket.join(group);
    });
    socket.on("user-added", async ({ grp, usr }) => {
      console.log("user rcvd", usr, grp);
      const id = USERS.get(usr);
      const my_socket = io.sockets.sockets.get(id);
      // if(socketToJoin)
      // console.log('id ',my_socket);
      if (my_socket) my_socket.join(grp);
      socket.to(grp).emit("user-added", grp, usr);
    });
    socket.on("remove-user", async ({ groupName, groupUser }) => {
      console.log("user rcvd to remove", groupUser, groupName);
      const id = USERS.get(groupUser);
      const my_socket = io.sockets.sockets.get(id);
      // if(socketToJoin)
      // console.log('id ',my_socket);
      if (my_socket) {
        my_socket.leave(groupName);
        my_socket.emit("user-removed", groupUser, groupName);
        console.log("removed");
      }
      socket.to(groupName).emit("user-removed", groupUser, groupName);
    });
    socket.on("sent-messege", async (msg) => {
      console.log(msg);
      try {
        const save = await chatAppControllers.addMessage(msg);
        console.log(save);
        if (save.status == "ok") {
          socket.to(msg.groupName).emit("received-msg", msg);
        } else {
          socket.emit("error", {
            error: `failed to add message, ${save.status}`,
          });
        }
      } catch (error) {
        console.error("Error in handling sent-message:", error);
        socket.emit("error", {
          error: "Internal server error in sent messege",
        });
      }
    });

    socket.on("mms", async (data) => {
      console.log("sending media in socket ctr;");

      const { fileName, buffer, type, sentBy, time, groupName } = data;
      const maxRetries = 3;

      let attempt = 0;

      while (attempt < maxRetries) {
        console.log("sending media in while");

        try {
          const fileUrl = await S3Services.uploadtos3(
            fileName,
            buffer,
            type,
            time
          );

          if (fileUrl) {
            console.log(fileUrl);
            const save = await chatAppControllers.addMessage({
              msg: `${fileName} ${fileUrl}`,
              time,
              sentBy,
              groupName,
              type,
            });
            console.log(save);
            if (save.status !== "ok") {
              socket.emit("error", {
                error: `failed to add messege , ${save.status}`,
              });
            }
            socket.to(groupName).emit("mms", {
              fileUrl,
              fileName,
              type,
              sentBy,
              time,
              groupName,
            });
          }
          break;
        } catch (error) {
          console.error(
            `Error uploading to S3 (attempt ${attempt + 1}):`,
            error
          );

          attempt++;
          await sleep(1000);
        }
      }

      if (attempt === maxRetries) {
        console.error(`Upload to S3 failed after ${maxRetries} attempts.`);

        socket.emit("error", {
          error: `Failed to upload to S3 after ${attempt + 1} attempts`,
        });
      }
    });

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    socket.on("disconnect", () => {
      USERS.forEach((value, key) =>{
        if(value === socket.id)
        console.log("disconnected", key);
      })
    });
  });
};

module.exports = {
  sockets,
};
