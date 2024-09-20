# 🚀 KalpDrop: Token Airdrop System on the Kalp Blockchain

## What is KalpDrop?

KalpDrop is a modern, user-friendly token airdrop system built on the Kalp blockchain. It allows users to claim tokens, check balances, and transfer tokens seamlessly through an intuitive web interface.

## 🌟 Features

- **Token Claiming**: Users can easily claim airdropped tokens.
- **Balance Checking**: Real-time balance updates for user wallets.
- **Token Transfers**: Smooth token transfers between addresses.
- **Total Supply Tracking**: Monitor the total number of tokens claimed.
- **Responsive Design**: Beautiful, animated UI that works on all devices.
- **Real-time Notifications**: Instant feedback on all user actions.

## 🛠 Tech Stack

- **Frontend**: Next.js with React
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Blockchain Interaction**: Kalp SDK
- **Notifications**: React Hot Toast
- **Icons**: React Icons

## 📦 Installation

Before you begin, ensure you have Node.js (version >=14.x) and npm (version >=6.x) installed.

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kalpdrop.git
cd kalpdrop
```

2. Install dependencies:
```bash
npm install
```
   
3. Create a `.env.local` file in the root directory and add your Kalp API key:
```
NEXT_PUBLIC_API_KEY=your_kalp_api_key_here
```
   
4. Start the development server:
```bash
npm run dev
```
   
5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🚀 Deployment

To deploy KalpDrop, follow these steps:

1. Build the application:
```bash
npm run build
```

3. Deploy to your preferred hosting platform (Vercel, Netlify, etc.).

4. Set up the `NEXT_PUBLIC_API_KEY` environment variable in your deployment platform's settings.

For detailed deployment instructions, refer to the [Deployment](https://www.netlify.com/blog/2016/09/29/a-step-by-step-guide-deploying-on-netlify/) section.

## 🧪 Smart Contract

The KalpDrop application interacts with a smart contract deployed on the Kalp blockchain. The contract handles token distribution, transfers, and balance management.

Key functions include:
- `Claim`: Allows users to claim airdropped tokens.
- `BalanceOf`: Retrieves the token balance for a given address.
- `TotalSupply`: Returns the total number of tokens claimed.
- `TransferFrom`: Enables token transfers between addresses.

For more details on the smart contract, see the [Smart Contract Documentation](https://care.kalp.studio/support/solutions/articles/1060000085617-how-to-deploy-a-smart-contract-on-kalp-studio).

## 🎨 UI/UX Features

- Smooth scrolling between sections
- Animated entrance for each section
- Interactive buttons with hover and click animations
- Persistent gradient background
- Custom toast notifications for user feedback
- Responsive design for mobile and desktop

## 🤝 Contributing

We welcome contributions to KalpDrop! Please feel free to contribute.

## 📄 License

KalpDrop is released under the [MIT License](#).

## 🙋‍♀️ Support

If you encounter any issues or have questions, please file an issue.

---

Built with ❤️ by Tanishq for the Kalp blockchain community.
