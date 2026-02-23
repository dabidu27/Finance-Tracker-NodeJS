import { useEffect, useState } from "react";
import { Text, SafeAreaView, StyleSheet, View, TextInput, SafeAreaViewBase, FlatList, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Modal } from "react-native";
import * as SecureStorage from 'expo-secure-store';
import axios from 'axios';


type TransactionRecord = { id: string, description: string, amount: string, category: string, is_expense: boolean };
type TransactionProps = { description: string, amount: string, category: string, is_expense: boolean };
const Transaction = ({ description, amount, category, is_expense }: TransactionProps) => (

    <View style={styles.card}>
        <View style={styles.leftColumn}>
            <Text style={styles.descriptionText}>{description}</Text>
            <Text style={[styles.amountText, { color: is_expense ? '#ff0000' : '#2ecc71' }]}>{amount}</Text>
        </View>
        <Text style={styles.categoryText}>{category}</Text>
    </View>
)
export default function HomeScreen() {

    const [balance, setBalance] = useState('');
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')

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

    useEffect(() => {
        fetchTransactions();
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContainer}>
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

                                <TouchableOpacity style={styles.addTransactionButton} onPress={() => { setModalVisible(false) }}>
                                    <Text style={styles.addTransactionText}>Add transaction</Text>
                                </TouchableOpacity>
                            </View>
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
                        />
                    </View>

                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.addIncomeButton} onPress={() => { setModalVisible(true) }}>
                            <Text style={styles.addIncomeText}>Add income</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.addExpenseButton} onPress={() => { setModalVisible(true) }}>
                            <Text style={styles.addExpenseText}>Add expense</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={transactions}
                        renderItem={({ item }) => (<Transaction description={item.description} amount={item.amount} category={item.category} is_expense={item.is_expense} />)}
                        keyExtractor={item => item.id.toString()}
                    />
                </View>
            </SafeAreaView>
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
    leftColumn: {
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)' //dims the background
    },

    modalView: {
        margin: 20,
        borderRadius: 20,
        backgroundColor: 'white',
        padding: 35,
        height: '50%'
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
})