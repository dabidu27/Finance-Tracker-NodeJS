import { SafeAreaView, View, Text, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import axios from 'axios';
import * as SecureStorage from 'expo-secure-store';

//with type TransactionRecord, we define a type so react knows what kind of elements to expect in the transaction array
type TransactionRecord = { id: string, description: string, amount: string, category: string, is_expense: boolean };
//with TransactionProps, we define a type used in the mini component we will define
type TransactionProps = { description: string, amount: string, category: string, is_expense: boolean };

//this is a custom mini component we define
//every transaction will look like  this after we map with renderItem in the flatList
const Transaction = ({ description, amount, category, is_expense }: TransactionProps) => (
    <View style={styles.card}>
        {/*We use 2 views to have description and amount on the left on the card, one below the other
        and the category on the right side of the card */}
        <View style={styles.leftColumn}>
            <Text style={styles.descriptionText}>{description}</Text>
            <Text style={[styles.amountText, { color: is_expense ? '#ff0000' : '#2ecc71' }]}>{amount}</Text>
        </View>
        <Text style={styles.categoryText}>{category}</Text>

    </View>
);

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

    //useEffect is used for running background tasks
    //imediatelly after the screen is drawn, use effect runs and fetchTransactions() is called
    //after the data arrives, the screen is redrawn
    //we use the empty array at the end [] to specify that the operation should only be done once
    //if we had [userId], it meant do this every time userId changes
    useEffect(() => {
        fetchTransactions();
    }, []);

    return (

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
                renderItem={({ item }) => (<Transaction description={item.description} amount={item.amount} category={item.category} is_expense={item.is_expense} />)}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
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
    leftColumn: {
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
        color: '#ff0000', // A nice finance blue
    }
})