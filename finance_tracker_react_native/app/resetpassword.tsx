import { Text, View, TouchableWithoutFeedback, TouchableOpacity, Keyboard, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';


export default function ResetPasswordScreen() {

    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    //unpack email parameter set from the previous screen
    const { email } = useLocalSearchParams();

    const handleChangePassword = async () => {


        if (!code || !newPassword || !confirmNewPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "Confirm password is not the same");
            setCode('');
            setNewPassword('');
            setConfirmNewPassword('');
            //we return to stop the code from trying to call the api
            return;
        }

        try {

            const baseUrl = 'http://192.168.1.105:8080/api/auth';
            const response = await axios.post(`${baseUrl}/reset_password`, { email: email, code: code, newPassword: newPassword });
            if (response.status === 200) {
                Alert.alert("Successfully updated password");
                //don't use ./index, as index is a special file and represents the root of the project; we just say ./
                router.push('./');
            }

        } catch (error: any) {

            const errorMessage = error.response?.data?.message || "Something went wrong";
            console.error('Reset error: ', errorMessage);
            Alert.alert("Error", errorMessage);
            setCode('');
            setNewPassword('');
            setConfirmNewPassword('');
        }

    }

    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>

                <View style={styles.formContainer}>

                    <TextInput

                        value={code}
                        onChangeText={setCode}
                        placeholder='6-digit code'
                        keyboardType='number-pad'
                        maxLength={6} //prevents user from writing more than 6 digits
                        style={styles.input}

                    />

                    <TextInput

                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder='New Password'
                        autoCapitalize='none'
                        secureTextEntry={true}
                        style={styles.input}
                    />

                    <TextInput

                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        placeholder='Confirm New Password'
                        autoCapitalize='none'
                        secureTextEntry={true}
                        style={styles.input}
                    />


                    <TouchableOpacity style={styles.button} onPress={() => {
                        handleChangePassword();
                        Keyboard.dismiss();
                    }}>
                        <Text style={styles.buttonText}>Change password</Text>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>


    )
}

const styles = StyleSheet.create({


    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f4f4f9'
    },

    formContainer: {
        paddingHorizontal: 30
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