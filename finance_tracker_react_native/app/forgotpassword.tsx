
import { View, TouchableWithoutFeedback, Keyboard, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios'
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {


    const handleSubmit = async () => {

        try {
            const baseUrl = 'http://192.168.1.105:8080/api/auth';
            const response = await axios.post(`${baseUrl}/forgot_password_code`, { email: email });

            if (response.status === 200) {
                console.log("Email submitted");
                router.push({ pathname: './resetpassword', params: { email } }); //we add params: {email} so the next page remembers the user email, which will be needed by the backend to find the user whose password it needs to update
            }
        } catch (error: any) {
            const errorMessage = error.response.data.message;
            console.error('Auth error: ', errorMessage);
        }
    }

    const [email, setEmail] = useState('');
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.formContainer}>

                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder='Email'
                        autoCapitalize='none'
                        style={styles.input}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            handleSubmit();
                            Keyboard.dismiss();
                        }}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>


                </View>
            </SafeAreaView>

        </TouchableWithoutFeedback>
    )
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f4f4f9',
        justifyContent: 'center', //justifyContent defines how child elements of a container are aligned along the main axis of a container
    },
    formContainer: {
        paddingHorizontal: 30,
    },

    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },

    button: {
        backgroundColor: '#007BFF', // A nice iOS blue
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
})