import { UserRepository } from "./src/repositories/userRepository.js";

const userRepo = new UserRepository();

async function testInsert() {
  try {
    const userData = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      username: "testuser",
      password: "hashedpassword123",
    };

    console.log("Testing user creation...");
    const result = await userRepo.create(userData);
    console.log("Success! Created user:", result);
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    process.exit(0);
  }
}

testInsert();
