"use client"
import React, { useEffect, useState, useCallback  } from 'react'
import { useKalpApi } from '@/hooks/useKalpAPI'
import { motion } from 'framer-motion'
import { Link, Element, scrollSpy } from 'react-scroll'
import toast, { Toaster } from 'react-hot-toast'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

const Home: React.FC = () => {
  const { claim, balanceOf, totalSupply, transferFrom, loading } = useKalpApi();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [totalAirdrop, setTotalAirdrop] = useState<number>(0);
  const [fromAddress, setFromAddress] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoadingTotalSupply, setIsLoadingTotalSupply] = useState<boolean>(false);

  const handleSetActive = (to: string) => {
    setActiveSection(to);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {type === 'success' ? (
                <FiCheckCircle className="h-10 w-10 text-green-500" />
              ) : (
                <FiXCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    ), { duration: 5000 })
  }

  const handleClaim = async () => {
    if (loading || !walletAddress) return;
  
    try {
      const data = await claim(walletAddress);
      await handleTotalSupply();
      await handleBalanceOf();
      console.log('Claim successful:', data);
      showNotification('success', 'Airdrop claimed successfully!');
    } catch (err) {
      console.error('Claim error:', err);
      showNotification('error', 'Failed to claim airdrop. Please try again.');
    }
  };

  const handleBalanceOf = async () => {
    try {
      const data = await balanceOf(walletAddress);
      setBalance(data.result.result)
      console.log('Balance:', data);
      showNotification('success', 'Balance updated successfully!');
    } catch (err) {
      console.error('BalanceOf error:', err);
      showNotification('error', 'Failed to fetch balance. Please try again.');
    }
  };

  const handleTransfer = async () => {
    try {
      const data = await transferFrom(fromAddress, toAddress, transferAmount);
      console.log('Transfer successful:', data);
      await handleBalanceOf();
      showNotification('success', 'Transfer completed successfully!');
    } catch (err) {
      console.error('Transfer error:', err);
      showNotification('error', 'Transfer failed. Please try again.');
    }
  };

  const handleTotalSupply = useCallback(async () => {
    if (isLoadingTotalSupply) return;
    
    setIsLoadingTotalSupply(true);
    try {
      const data = await totalSupply();
      setTotalAirdrop(data.result.result);
      console.log('Total Supply:', data);
    } catch (err) {
      console.error('TotalSupply error:', err);
      showNotification('error', 'Failed to fetch total supply. Please try again.');
    } finally {
      setIsLoadingTotalSupply(false);
    }
  }, [isLoadingTotalSupply, totalSupply]);

  useEffect(() => {
    if (!isInitialized) {
      handleTotalSupply();
      setIsInitialized(true);
    }
    scrollSpy.update();
  }, [isInitialized, handleTotalSupply]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 } 
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Toaster position="top-right" />
      <motion.div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, #3B82F6, #8B5CF6, #EC4899)',
        }}
      />

      {/* Navigation Dots */}
      <nav className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <ul className="flex flex-col space-y-4">
          {["hero", "features", "claim", "stats", "transfer"].map((section) => (
            <li key={section}>
              <Link
                to={section}
                spy={true}
                smooth={true}
                duration={500}
                onSetActive={handleSetActive}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full cursor-pointer border-2 border-white ${activeSection === section ? 'bg-white' : 'bg-transparent'}`}
                  whileHover={{ scale: 1.5 }}
                  whileTap={{ scale: 0.9 }}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero Section */}
      <Element name="hero" className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="container mx-auto px-4 z-10 text-center"
          initial="hidden"
          whileInView="visible"
          variants={sectionVariants}
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.h1 variants={itemVariants} className="text-7xl font-bold mb-6">Welcome to KalpDrop</motion.h1>
          <motion.p variants={itemVariants} className="text-3xl mb-10">Experience the future of token distribution</motion.p>
          <motion.div variants={itemVariants}>
            <Link to="claim" smooth={true} duration={500}>
              <motion.button
                className="bg-white text-blue-500 font-bold py-4 px-8 rounded-full text-xl hover:bg-opacity-80 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Claim Your Tokens
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </Element>

      {/* Features Section */}
      <Element name="features" className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="container mx-auto px-4 z-10"
          initial="hidden"
          whileInView="visible"
          variants={sectionVariants}
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants} className="text-5xl font-bold text-center mb-16">Why Choose KalpDrop?</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: '🚀', title: 'Fast Transactions', description: 'Experience lightning-fast token transfers on the Kalp blockchain.' },
              { icon: '🔒', title: 'Secure Platform', description: 'Your assets are protected by state-of-the-art blockchain technology.' },
              { icon: '💰', title: 'Easy Claiming', description: 'Claim your tokens with just a few clicks, hassle-free.' }
            ].map((feature, index) => (
              <motion.div key={index} className="text-center" variants={itemVariants}>
                <motion.div 
                  className="text-7xl mb-6"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Element>

      {/* Claim Section */}
      <Element name="claim" className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="container mx-auto px-4 z-10"
          initial="hidden"
          whileInView="visible"
          variants={sectionVariants}
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants} className="text-5xl font-bold text-center mb-12">Claim Your Tokens</motion.h2>
          <motion.div variants={itemVariants} className="max-w-md mx-auto bg-white bg-opacity-10 rounded-lg shadow-lg p-8 backdrop-filter backdrop-blur-lg">
            <input 
              type="text" 
              placeholder="Enter your wallet address" 
              className="w-full p-4 mb-6 border border-white border-opacity-50 rounded bg-transparent text-white text-lg focus:outline-none focus:border-opacity-100 transition duration-300" 
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <motion.button 
              className="w-full bg-white text-blue-500 font-bold py-4 px-4 rounded text-lg hover:bg-opacity-80 transition duration-300 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              onClick={handleClaim} 
              disabled={loading || !walletAddress}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Claiming..." : "Claim Tokens"}
            </motion.button>
          </motion.div>
        </motion.div>
      </Element>

      {/* Stats Section */}
      <Element name="stats" className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="container mx-auto px-4 z-10"
          initial="hidden"
          whileInView="visible"
          variants={sectionVariants}
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants} className="text-5xl font-bold text-center mb-16">Airdrop Statistics</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div 
              variants={itemVariants}
              className="bg-white bg-opacity-10 rounded-lg shadow-lg p-10 text-center backdrop-filter backdrop-blur-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-3xl font-semibold mb-6">Total Tokens Claimed</h3>
              <p className="text-6xl font-bold text-blue-300">{totalAirdrop}</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white bg-opacity-10 rounded-lg shadow-lg p-10 text-center backdrop-filter backdrop-blur-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-3xl font-semibold mb-6">Your Balance</h3>
              <p className="text-6xl font-bold text-blue-300">{balance}</p>
              <motion.button 
                className="mt-8 bg-white text-blue-500 font-bold py-3 px-6 rounded text-lg hover:bg-opacity-80 transition duration-300"
                onClick={handleBalanceOf}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh Balance
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </Element>

      {/* Transfer Section */}
      <Element name="transfer" className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="container mx-auto px-4 z-10"
          initial="hidden"
          whileInView="visible"
          variants={sectionVariants}
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants} className="text-5xl font-bold text-center mb-12">Transfer Tokens</motion.h2>
          <motion.div variants={itemVariants} className="max-w-md mx-auto bg-white bg-opacity-10 rounded-lg shadow-lg p-8 backdrop-filter backdrop-blur-lg">
            <input 
              type="text" 
              placeholder="From address" 
              className="w-full p-4 mb-6 border border-white border-opacity-50 rounded bg-transparent text-white text-lg focus:outline-none focus:border-opacity-100 transition duration-300" 
              onChange={(e) => setFromAddress(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="To address" 
              className="w-full p-4 mb-6 border border-white border-opacity-50 rounded bg-transparent text-white text-lg focus:outline-none focus:border-opacity-100 transition duration-300" 
              onChange={(e) => setToAddress(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Amount" 
              className="w-full p-4 mb-6 border border-white border-opacity-50 rounded bg-transparent text-white text-lg focus:outline-none focus:border-opacity-100 transition duration-300" 
              onChange={(e) => setTransferAmount(Number(e.target.value))}
            />
            <motion.button 
              className="w-full bg-white text-blue-500 font-bold py-4 px-4 rounded text-lg hover:bg-opacity-80 transition duration-300"
              onClick={handleTransfer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Transfer Tokens
            </motion.button>
          </motion.div>
        </motion.div>
      </Element>

      {/* Footer */}
      <footer className="text-white py-6 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 KalpDrop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home;