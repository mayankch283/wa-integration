# WhatsApp Frontend

This project is a React application that interacts with the WhatsApp API to send messages and retrieve their delivery statuses. It provides a user-friendly interface for sending messages and viewing their statuses.

## Project Structure

```
whatsapp-frontend
├── src
│   ├── api
│   │   └── whatsapp.ts        # Functions to interact with the WhatsApp API
│   ├── components
│   │   ├── MessageForm.tsx    # Component for sending messages
│   │   ├── MessageStatus.tsx   # Component for displaying message statuses
│   │   └── RequestLogs.tsx     # Component for viewing request logs
│   ├── types
│   │   └── index.ts            # TypeScript interfaces and types
│   ├── App.tsx                 # Main application component
│   └── index.tsx               # Entry point of the application
├── package.json                 # npm configuration file
├── tsconfig.json               # TypeScript configuration file
└── README.md                   # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd whatsapp-frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```
This will launch the application in your default web browser.

## API Integration

The application interacts with the WhatsApp API to send messages and retrieve their statuses. Ensure you have the necessary API credentials and environment variables set up.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.