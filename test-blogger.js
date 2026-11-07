require("dotenv").config();

const { google } = require("googleapis");

const auth = new google.auth.OAuth2(
  process.env.BLOGGER_CLIENT_ID,
  process.env.BLOGGER_CLIENT_SECRET
);

auth.setCredentials({
  refresh_token: process.env.BLOGGER_REFRESH_TOKEN
});

const blogger = google.blogger({
  version: "v3",
  auth
});

async function main() {
  try {
    const response = await blogger.blogs.get({
      blogId: process.env.BLOGGER_BLOG_ID
    });

    console.log("Blogger connection successful!");
    console.log("Blog title:", response.data.name);
    console.log("Blog URL:", response.data.url);
    console.log("Blog ID:", response.data.id);
  } catch (error) {
    console.error("Blogger connection failed:", error.message);
  }
}

main();
