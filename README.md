
# Vercel Clone

This project is a clone of Vercel, created using TypeScript, Redis, S3, and Express. It focuses on the system design and architecture of backend services, with a bash script to simulate the frontend.

A bash script to simulate the frontend. This script automates tasks related to the frontend simulation.

## Technologies Used

- **TypeScript**: For type-safe JavaScript code.
- **Redis**: Used for caching and message brokering.
- **S3**: For file storage.
- **Express**: A web application framework for Node.js.

## Setup and Installation

1. Clone the repository:

```sh
git clone https://github.com/cosmos1721/vercel-clone.git
cd vercel-clone
```

2. Install dependencies for services:

```sh
cd requestHandler
npm install
cd ../uploadService
npm install
cd ../deploymentService
npm install
```

3. Run the services:

```sh
# In the requestHandler directory
npm run build; npm run start

# In the uploadService directory
npm run build; npm run start

# In the deploymentService directory
npm run build; npm run start
```

4. Execute the bash script to simulate the frontend:

```sh
sh script.sh
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

