import { useCallback, useEffect, useState } from "react";
import { Text, SafeAreaView, StyleSheet, View, TextInput, SafeAreaViewBase, FlatList, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native";
import * as SecureStorage from 'expo-secure-store';
import axios from 'axios';
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";


type TransactionRecord = { id: string, description: string, amount: string, category: string, is_expense: boolean, created_at: string };
type TransactionProps = { description: string, amount: string, category: string, is_expense: boolean, created_at: string, onEdit: () => void, onDelete: () => void };
const Transaction = ({ description, amount, category, is_expense, created_at, onEdit, onDelete }: TransactionProps) => (

    <Swipeable renderRightActions={() => renderRightActions(onEdit, onDelete)}>
        <View style={styles.card}>
            <View style={styles.column}>
                <Text style={styles.descriptionText}>{description}</Text>
                <Text style={[styles.amountText, { color: is_expense ? '#ff0000' : '#2ecc71' }]}>{amount}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.categoryText}>{category}</Text>
                <Text style={styles.categoryText}>{created_at}</Text>
            </View>

        </View >
    </Swipeable>
)

const formatString = (dateString: string) => {

    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}


const renderRightActions = (onEdit: () => void, onDelete: () => void) => {

    return (

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity onPress={onEdit} style={[styles.swipeButton, { backgroundColor: '#3498db' }]}>
                <Ionicons name='pencil' size={24} color='white' />
            </TouchableOpacity>

            <TouchableOpacity onPress={onDelete} style={[styles.swipeButton, { backgroundColor: '#e74c3c' }]}>
                <Ionicons name='trash' size={24} color='white' />
            </TouchableOpacity>
        </View>
    )

}
export default function HomeScreen() {

    const [balance, setBalance] = useState('');
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [isExpense, setIsExpense] = useState(true);

    const fetchTransactions = async () => {

        try {

            const baseUrl = 'http://192.168.1.105:8080/api/transactions';
            const token = await SecureStorage.getItemAsync('token');

            const response = await axios.get(`${baseUrl}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Successfully fetched transactions');
            setTransactions(response.data.slice(0, 3)); //get only the first 3 transactions (last 3 transactions by date)
        } catch (error) {
            console.error(error);
        }

    }

    const fetchBalance = async () => {

        try {
            const baseUrl = "http://192.168.1.105:8080/api/transactions";
            const token = await SecureStorage.getItemAsync('token');

            const response = await axios.get(`${baseUrl}/balance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("Successfully fetched balance");
            const balance = response.data.balance;
            setBalance(balance);
        } catch (error) {
            console.error(error);
        }
    }

    const updateBalance = async (calculatedBalance?: string | number) => { //calculatedBalance?: string | number means the parameter is optional and can be a number or a string

        try {

            const valueToSend = calculatedBalance !== undefined ? calculatedBalance : balance; //if the parameter is not undefined, use the parameter (for updating balance after a transaction), else use the balance from setBalance (for updating balance after user enters it)
            if (valueToSend === '' || valueToSend === undefined) return;
            const baseUrl = 'http://192.168.1.105:8080/api/transactions';
            const token = await SecureStorage.getItemAsync('token');

            const response = await axios.post(`${baseUrl}/balance`, { balance: Number(valueToSend) }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("Successfully updated balance");
            setBalance(response.data.balance);
        } catch (error) {
            console.error(error);
        }
    }

    const handleSave = async () => {

        try {
            const baseUrl = 'http://192.168.1.105:8080/api/transactions';
            const token = await SecureStorage.getItemAsync('token');
            const newTransaction = { description, amount: amount, category, is_expense: isExpense };

            const response = await axios.post(baseUrl, newTransaction, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 201) {

                console.log('Transaction added successfully');
                //set inputs back to default
                setDescription('');
                setAmount('');
                setCategory('')
                setModalVisible(false)
                //refresh the list
                fetchTransactions();
                const newBalance = isExpense ? Number(balance) - Number(amount) : Number(balance) + Number(amount)
                setBalance(String(newBalance)); //because setBalance is async (all state updates are async) react will update it on the next render
                updateBalance(newBalance); //this means that if we don't pass the updated balance to use, updateBalance will be called before balance is updated (before setBalance runs)
            }
        } catch (error) {
            console.error(error);
        }

    }


    const handleDelete = async (id: string, is_expense: boolean, amount: string) => {

        try {
            const baseUrl = 'http://192.168.1.105:8080/api/transactions';
            const token = await SecureStorage.getItemAsync('token');

            const response = await axios.delete(`${baseUrl}/${id}`, {
                headers:
                    { 'Authorization': `Bearer ${token}` }
            });
            console.log('Successfully deleted transaction');

            //update the screen with the up to date transactions (without the deleted one)
            await fetchTransactions();
            const newBalance = is_expense == true ? Number(balance) + Number(amount) : Number(balance) - Number(amount);
            await updateBalance(newBalance);
        } catch (error: any) {
            console.log('Failed to delete transaction: ', error.response?.data || error.message);
        }



    }

    // useEffect(() => {
    //     fetchBalance();
    //     fetchTransactions();
    // }, [])

    //replace useEffect with useFocusEffect, that runs the functions everytime the HomeScreen tab is opened
    //useEffect only fetches once per app openning
    //we need this because we can delete and edit transactions from the dashboard, where we do indeed setTransactions, but it only affects the transactions from the dashboard
    //and we cannot do setBalance there
    useFocusEffect(
        useCallback(() => {
            fetchBalance();
            fetchTransactions();
        }, [])
    )
    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <GestureHandlerRootView>
                <SafeAreaView style={styles.container}>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(!modalVisible);
                        }}
                    >
                        {/*Tapping this TouchableWithoutFeedback closes the Modal */}
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View style={styles.modalContainer}>
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    style={{ width: '100%' }}
                                >
                                    {/*Tapping this TouchableWithoutFeedback closes the keyboard */}
                                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                        <View style={styles.modalView}>
                                            <Text style={styles.label}>Add description</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={description}
                                                onChangeText={setDescription}
                                            />

                                            <Text style={styles.label}>Add amount</Text>
                                            <TextInput
                                                value={amount}
                                                onChangeText={setAmount}
                                                keyboardType="numeric"
                                                style={styles.input}
                                            />
                                            <Text style={styles.label}>Add category</Text>
                                            <TextInput
                                                value={category}
                                                onChangeText={setCategory}
                                                style={styles.input}
                                            />

                                            <TouchableOpacity style={styles.addTransactionButton} onPress={() => { handleSave() }}>
                                                <Text style={styles.addTransactionText}>Add transaction</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </KeyboardAvoidingView>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>


                    <View>

                        <View style={styles.balanceContainer}>
                            <Text style={styles.label}>Total Balance</Text>
                            <TextInput
                                style={styles.balanceInput}
                                value={balance}
                                onChangeText={setBalance}
                                placeholder="Balance"
                                keyboardType='numeric'
                                onBlur={() => updateBalance()} //trigers when the user taps outside the input
                                onSubmitEditing={() => updateBalance()} //trrigers when the users hits "done" on the keyboard
                            />
                        </View>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity style={styles.addIncomeButton} onPress={() => {
                                setModalVisible(true)
                                setIsExpense(false)
                            }}>
                                <Text style={styles.addIncomeText}>Add income</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.addExpenseButton} onPress={() => {
                                setModalVisible(true)
                                setIsExpense(true)
                            }}>
                                <Text style={styles.addExpenseText}>Add expense</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={transactions}
                            renderItem={({ item }) => (<Transaction description={item.description} amount={item.amount} category={item.category} is_expense={item.is_expense} created_at={formatString(item.created_at)} onEdit={() => { console.log("Edit pressed") }} onDelete={() => handleDelete(item.id, item.is_expense, item.amount)} />)}
                            keyExtractor={item => item.id.toString()}
                        />
                    </View>

                </SafeAreaView>
            </GestureHandlerRootView>
        </TouchableWithoutFeedback>

    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f4f4f9',
        paddingTop: 20,
    },

    card: {

        backgroundColor: '#fff',
        padding: 18,
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    column: {
        flexDirection: 'column',
    },

    label: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },

    balanceContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },

    balanceInput: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#2c3e50',
    },

    actionButtonsContainer: {
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 30,
        alignItems: 'center',
        gap: 20,
        flexDirection: 'row'
    },

    addIncomeButton: {
        backgroundColor: '#2ecc71',
        borderRadius: 20,
        padding: 10,
        //shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },

    addIncomeText: {
        color: 'white',
        fontWeight: 'bold'
    },

    addExpenseButton: {
        backgroundColor: '#ff0000',
        borderRadius: 20,
        padding: 10,
        //shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },

    addExpenseText: {
        color: 'white',
        fontWeight: 'bold'
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', //the modal now stucks to the bottom of the screen
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)' //dims the background
    },

    modalView: {
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: 'white',
        paddingHorizontal: 30,
        paddingTop: 35,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,

    },

    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
    },

    addTransactionButton: {
        borderRadius: 20,
        padding: 10,
        backgroundColor: 'blue',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        alignItems: 'center'

    },

    addTransactionText: {

        color: 'white',
        fontWeight: 'bold'
    },

    descriptionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },

    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff0000'
    },

    categoryText: {
        fontSize: 13,
        textTransform: 'uppercase',
        color: '#888'
    },

    swipeButton: {

        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: '100%',
        borderRadius: 12,
        marginLeft: 10
    }
})