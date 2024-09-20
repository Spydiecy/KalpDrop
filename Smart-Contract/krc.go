package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/p2eengineering/kalp-sdk-public/kalpsdk"
)

// Define key names for options
const nameKey = "name"
const symbolKey = "symbol"
const decimalsKey = "decimals"
const totalSupplyKey = "totalSupply"

// Define objectType names for prefix
const transactionPrefix = "tx"

// SmartContract provides functions for transferring tokens between accounts
type SmartContract struct {
	kalpsdk.Contract
}

// event provides an organized struct for emitting events
type event struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Value int    `json:"value"`
}

// Transaction represents a token transaction
type Transaction struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Amount int    `json:"amount"`
	Type   string `json:"type"`
	Time   int64  `json:"time"`
}

// Claim creates new tokens and adds them to minter's account balance
// This function triggers a Transfer event
func (s *SmartContract) Claim(sdk kalpsdk.TransactionContextInterface, amount int, address string) error {
	// Check if contract has been initialized first
	initialized, err := checkInitialized(sdk)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	if amount <= 0 {
		return fmt.Errorf("claim amount must be a positive integer")
	}

	// Update balance of the address
	currentBalanceBytes, err := sdk.GetState(address)
	if err != nil {
		return fmt.Errorf("failed to read account %s from world state: %v", address, err)
	}

	var currentBalance int
	if currentBalanceBytes == nil {
		currentBalance = 0
	} else {
		currentBalance, _ = strconv.Atoi(string(currentBalanceBytes))
	}

	updatedBalance, err := add(currentBalance, amount)
	if err != nil {
		return err
	}

	err = sdk.PutStateWithoutKYC(address, []byte(strconv.Itoa(updatedBalance)))
	if err != nil {
		return err
	}

	// Update total supply
	totalSupplyBytes, err := sdk.GetState(totalSupplyKey)
	if err != nil {
		return fmt.Errorf("failed to retrieve total token supply: %v", err)
	}

	var totalSupply int
	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes))
	}

	totalSupply, err = add(totalSupply, amount)
	if err != nil {
		return err
	}

	err = sdk.PutStateWithoutKYC(totalSupplyKey, []byte(strconv.Itoa(totalSupply)))
	if err != nil {
		return err
	}

	// Record transaction
	transaction := Transaction{
		From:   "0x0",
		To:     address,
		Amount: amount,
		Type:   "Claim",
		Time:   time.Now().Unix(),
	}
	transactionJSON, err := json.Marshal(transaction)
	if err != nil {
		return fmt.Errorf("failed to marshal transaction: %v", err)
	}
	err = sdk.PutStateWithoutKYC(fmt.Sprintf("%s_%s_%d", transactionPrefix, address, time.Now().UnixNano()), transactionJSON)
	if err != nil {
		return fmt.Errorf("failed to record transaction: %v", err)
	}

	// Emit the Transfer event
	transferEvent := event{"0x0", address, amount}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = sdk.SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("Account %s balance updated from %d to %d", address, currentBalance, updatedBalance)

	return nil
}

// BalanceOf returns the balance of the given account
func (s *SmartContract) BalanceOf(sdk kalpsdk.TransactionContextInterface, account string) (int, error) {
	// Check if contract has been initialized first
	initialized, err := checkInitialized(sdk)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	balanceBytes, err := sdk.GetState(account)
	if err != nil {
		return 0, fmt.Errorf("failed to read from world state: %v", err)
	}
	if balanceBytes == nil {
		return 0, fmt.Errorf("the account %s does not exist", account)
	}

	balance, _ := strconv.Atoi(string(balanceBytes))

	return balance, nil
}

// TotalSupply returns the total token supply
func (s *SmartContract) TotalSupply(sdk kalpsdk.TransactionContextInterface) (int, error) {
	// Check if contract has been initialized first
	initialized, err := checkInitialized(sdk)
	if err != nil {
		return 0, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return 0, fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Retrieve total supply of tokens from state of smart contract
	totalSupplyBytes, err := sdk.GetState(totalSupplyKey)
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve total token supply: %v", err)
	}

	var totalSupply int

	// If no tokens have been minted, return 0
	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes))
	}

	log.Printf("TotalSupply: %d tokens", totalSupply)

	return totalSupply, nil
}

// TransferFrom transfers the value amount from the "from" address to the "to" address
// This function triggers a Transfer event
func (s *SmartContract) TransferFrom(sdk kalpsdk.TransactionContextInterface, from string, to string, value int) error {
	// Check if contract has been initialized first
	initialized, err := checkInitialized(sdk)
	if err != nil {
		return fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Get ID of submitting client identity
	spender, err := sdk.GetUserID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	// Initiate the transfer
	err = transferHelper(sdk, from, to, value)
	if err != nil {
		return fmt.Errorf("failed to transfer: %v", err)
	}

	// Record transaction
	transaction := Transaction{
		From:   from,
		To:     to,
		Amount: value,
		Type:   "Transfer",
		Time:   time.Now().Unix(),
	}
	transactionJSON, err := json.Marshal(transaction)
	if err != nil {
		return fmt.Errorf("failed to marshal transaction: %v", err)
	}
	err = sdk.PutStateWithoutKYC(fmt.Sprintf("%s_%s_%d", transactionPrefix, from, time.Now().UnixNano()), transactionJSON)
	if err != nil {
		return fmt.Errorf("failed to record transaction: %v", err)
	}

	// Emit the Transfer event
	transferEvent := event{from, to, value}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = sdk.SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("spender %s transferred %d tokens from %s to %s", spender, value, from, to)

	return nil
}

// Name returns a descriptive name for fungible tokens in this contract
func (s *SmartContract) Name(sdk kalpsdk.TransactionContextInterface) (string, error) {
	// Check if contract has been initialized first
	initialized, err := checkInitialized(sdk)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	bytes, err := sdk.GetState(nameKey)
	if err != nil {
		return "", fmt.Errorf("failed to get Name bytes: %s", err)
	}

	return string(bytes), nil
}

// Symbol returns an abbreviated name for fungible tokens in this contract.
func (s *SmartContract) Symbol(sdk kalpsdk.TransactionContextInterface) (string, error) {
	// Check if contract has been initialized first
	initialized, err := checkInitialized(sdk)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	bytes, err := sdk.GetState(symbolKey)
	if err != nil {
		return "", fmt.Errorf("failed to get Symbol: %v", err)
	}

	return string(bytes), nil
}

// Initialize sets information for a token and initializes contract.
func (s *SmartContract) Initialize(sdk kalpsdk.TransactionContextInterface, name string, symbol string, decimals string) (bool, error) {
	// Check minter authorization - this sample assumes Org1 is the central banker with privilege to initialize contract
	clientMSPID, err := sdk.GetClientIdentity().GetMSPID()
	if err != nil {
		return false, fmt.Errorf("failed to get MSPID: %v", err)
	}
	if clientMSPID != "mailabs" {
		return false, fmt.Errorf("client is not authorized to initialize contract")
	}

	// Check contract options are not already set, client is not authorized to change them once initialized
	bytes, err := sdk.GetState(nameKey)
	if err != nil {
		return false, fmt.Errorf("failed to get Name: %v", err)
	}
	if bytes != nil {
		return false, fmt.Errorf("contract options are already set, client is not authorized to change them")
	}

	err = sdk.PutStateWithoutKYC(nameKey, []byte(name))
	if err != nil {
		return false, fmt.Errorf("failed to set token name: %v", err)
	}

	err = sdk.PutStateWithoutKYC(symbolKey, []byte(symbol))
	if err != nil {
		return false, fmt.Errorf("failed to set symbol: %v", err)
	}

	err = sdk.PutStateWithoutKYC(decimalsKey, []byte(decimals))
	if err != nil {
		return false, fmt.Errorf("failed to set token decimals: %v", err)
	}

	return true, nil
}

// GetTransactionHistory returns the transaction history for a given address
func (s *SmartContract) GetTransactionHistory(sdk kalpsdk.TransactionContextInterface, address string) ([]Transaction, error) {
	iterator, err := sdk.GetStateByPartialCompositeKey(transactionPrefix+"_"+address, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction history: %v", err)
	}
	defer iterator.Close()

	var transactions []Transaction
	for iterator.HasNext() {
		queryResponse, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next transaction: %v", err)
		}

		var transaction Transaction
		err = json.Unmarshal(queryResponse.Value, &transaction)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal transaction: %v", err)
		}

		transactions = append(transactions, transaction)
	}

	return transactions, nil
}

// Helper Functions

// transferHelper is a helper function that transfers tokens from the "from" address to the "to" address
func transferHelper(sdk kalpsdk.TransactionContextInterface, from string, to string, value int) error {
	if from == to {
		return fmt.Errorf("cannot transfer to and from same client account")
	}

	if value < 0 {
		return fmt.Errorf("transfer amount cannot be negative")
	}

	fromCurrentBalanceBytes, err := sdk.GetState(from)
	if err != nil {
		return fmt.Errorf("failed to read client account %s from world state: %v", from, err)
	}

	if fromCurrentBalanceBytes == nil {
		return fmt.Errorf("client account %s has no balance", from)
	}

	fromCurrentBalance, _ := strconv.Atoi(string(fromCurrentBalanceBytes))

	if fromCurrentBalance < value {
		return fmt.Errorf("client account %s has insufficient funds", from)
	}

	toCurrentBalanceBytes, err := sdk.GetState(to)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	var toCurrentBalance int
	if toCurrentBalanceBytes == nil {
		toCurrentBalance = 0
	} else {
		toCurrentBalance, _ = strconv.Atoi(string(toCurrentBalanceBytes))
	}

	fromUpdatedBalance, err := sub(fromCurrentBalance, value)
	if err != nil {
		return err
	}

	toUpdatedBalance, err := add(toCurrentBalance, value)
	if err != nil {
		return err
	}

	err = sdk.PutStateWithoutKYC(from, []byte(strconv.Itoa(fromUpdatedBalance)))
	if err != nil {
		return err
	}

	err = sdk.PutStateWithoutKYC(to, []byte(strconv.Itoa(toUpdatedBalance)))
	if err != nil {
		return err
	}

	log.Printf("client %s balance updated from %d to %d", from, fromCurrentBalance, fromUpdatedBalance)
	log.Printf("recipient %s balance updated from %d to %d", to, toCurrentBalance, toUpdatedBalance)

	return nil
}

// add two numbers checking for overflow
func add(b int, q int) (int, error) {
	sum := q + b
	if (sum < q || sum < b) == (b >= 0 && q >= 0) {
		return 0, fmt.Errorf("math: addition overflow occurred %d + %d", b, q)
	}
	return sum, nil
}

// Checks that contract options have been already initialized
func checkInitialized(sdk kalpsdk.TransactionContextInterface) (bool, error) {
	tokenName, err := sdk.GetState(nameKey)
	if err != nil {
		return false, fmt.Errorf("failed to get token name: %v", err)
	}

	if tokenName == nil {
		return false, nil
	}

	return true, nil
}

// sub two numbers checking for underflow
func sub(b int, q int) (int, error) {
	if q <= 0 {
		return 0, fmt.Errorf("error: the subtraction number is %d, it should be greater than 0", q)
	}
	if b < q {
		return 0, fmt.Errorf("error: the number %d is not enough to be subtracted by %d", b, q)
	}
	diff := b - q

	return diff, nil
}
