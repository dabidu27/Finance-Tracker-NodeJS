import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import * as SecureStorage from 'expo-secure-store';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

//with type TransactionRecord, we define a type so react knows what kind of elements to expect in the transaction array
type TransactionRecord = { id: string, description: string, amount: string, category: string, is_expense: boolean, created_at: string };
//with TransactionProps, we define a type used in the mini component we will define
//when we tell the component we will recive those parameters (because we can see the componenet is written like a function), when we enforce the type :TransactionProps, it forces us to pass all that we need
type TransactionProps = { description: string, amount: string, category: string, is_expense: boolean, created_at: string, onEdit: () => void, onDelete: () => void };

//this is a custom mini component we define
//every transaction will look like  this after we map with renderItem in the flatList
const Transaction = ({ description, amount, category, is_expense, created_at, onEdit, onDelete }: TransactionProps) => (

    //to make the cards swipeable, wrap them in a Swipeable
    <Swipeable renderRightActions={() => renderRightActions(onEdit, onDelete)}>
        <View style={styles.card}>
            {/*We use 2 views to have description and amount on the left on the card, one below the other
        and the category and date on the right side of the card.  They will be on separate sides because the card that holds them
        has justify-content: 'space between'. So we have 2 columns with space between them => one on the left, one on the right*/}
            <View style={styles.column}>
                <Text style={styles.descriptionText}>{description}</Text>
                <Text style={[styles.amountText, { color: is_expense ? '#ff0000' : '#2ecc71' }]}>{amount}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.categoryText}>{category}</Text>
                <Text style={styles.categoryText}>{formatString(created_at)}</Text>
            </View>
        </View>
    </Swipeable>
);

const formatString = (createdAt: string) => {

    const date = new Date(createdAt);
    return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

//this is a function that we define for the Swipeable component
//it takes as parameters 2 functions, onEdit and onDelete, that it uses at the onPress
//we cannot directly pass handleDelete and handleDelete because they are written inside the screen function,
//and this function is outside

//we use this function above in the Transaction component we defined, so the handleDelete and handleEdit functions can be passed
//through the list of arguments of that component (function)
//this function defines what is shown when we swipe the card
const renderRightActions = (onEdit: () => void, onDelete: () => void) => {

    return (

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity style={[styles.swipeButton, { backgroundColor: '#3498db' }]} onPress={onEdit}>
                <Ionicons name="pencil" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.swipeButton, { backgroundColor: '#e74c3c' }]} onPress={onDelete}>
                <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
        </View>

    )
}

export default function DashboardScreen() {

    //transactions is by default an empty array that expects elements of the TransactionRecord type
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const fetchTransactions = async () => {

        try {
            const baseUrl = 'http://192.168.1.105:8080/api/transactions'
            const token = await SecureStorage.getItemAsync('token');
            const response = await axios.get(`${baseUrl}`, {
                headers: {

                    Authorization: `Bearer ${token}`
                }
            }
            );

            setTransactions(response.data);
            console.log('Successfully fetched transactions');
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
            return balance
        } catch (error) {
            console.error(error);
        }
    }

    const updateBalance = async (balance: Number) => {

        try {

            const baseUrl = 'http://192.168.1.105:8080/api/transactions';
            const token = await SecureStorage.getItemAsync('token');

            const response = await axios.post(`${baseUrl}/balance`, { balance: balance }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("Successfully updated balance");
        } catch (error) {
            console.error(error);
        }
    }

    const handleDelete = async (id: string, is_expense: boolean, amount: string) => {

        try {
            const baseUrl = 'http://192.168.1.105:8080/api/transactions';
            const token = await SecureStorage.getItemAsync('token');

            const response = await axios.delete(`${baseUrl}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            //the api call returns only the transaction that was delete, so we cannot setTransactions(response.data)
            //what we do is we set transactions to be all transactions besides the one we just deleted (by filtering out the one
            //that has the id as the one we just deleted)
            //we do this because we need to update the screen immediately

            //when we pass an arrow function the a set function like this, react goes into its internal memory and gets the 100% guaranteed most up to date data
            //prevTransactions is the array that holds that value grabbed by react (it could have been named anything)
            //or we could have called fetchTransactions() because that updates the transactions array with the newest data from the db
            setTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction.id !== id));
            console.log('Successfully delete transaction');

            const balance = await fetchBalance();
            const newBalance = is_expense ? Number(balance) + Number(amount) : Number(balance) - Number(amount);
            await updateBalance(newBalance);
            console.log('Successfully updated balance');
        } catch (error: any) {
            console.error("Failed to delete transaction:", error.response?.data || error.message);
        }

    }

    //useEffect is used for running background tasks
    //imediatelly after the screen is drawn, use effect runs and fetchTransactions() is called
    //after the data arrives, the screen is redrawn
    //we use the empty array at the end [] to specify that the operation should only be done once
    //if we had [userId], it meant do this every time userId changes
    // useEffect(() => {
    //     fetchTransactions();
    // }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTransactions()
        }, [])
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {/*We need GestureHandlerRootView to make the Swipeable work */}
            <SafeAreaView style={styles.container}>
                {/*we use flat list to draw a list from the array of transactions 
            data = {transactions} => look at the transactions array
            renderItem tells what to do to each element of the array
            we map item to a custom componenet we defined above; each element in the array is transformed into that custom component
            keyExtractor stores the unique id of each transaction*/}

                <FlatList

                    data={transactions}
                    //notice that the function after => is with () (not {}) and has no return
                    //this means instantly run what is inside
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (<Transaction description={item.description} amount={item.amount} category={item.category} is_expense={item.is_expense} created_at={item.created_at} onEdit={() => { console.log('Edit button clicked') }} onDelete={() => handleDelete(item.id, item.is_expense, item.amount)} />)} //keyExtractor got the id; also, see that here we pass the handleDelete and handleEdit functions

                />
            </SafeAreaView>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f9',
        paddingTop: 20, // Gives a little room at the top
    },
    card: {
        backgroundColor: '#fff',
        padding: 18,
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 12,
        // Flexbox Magic: This puts the leftColumn and the amount side-by-side!
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // Optional iOS Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2, // For Android shadow
    },
    //a view that has this style puts its element one below the other
    column: {
        flexDirection: 'column',
    },
    descriptionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    categoryText: {
        fontSize: 13,
        color: '#888',
        textTransform: 'uppercase', // Makes the category look like a neat little label
    },
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff0000'
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