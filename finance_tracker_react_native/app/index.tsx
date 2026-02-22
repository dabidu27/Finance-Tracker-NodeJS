import { StyleSheet, SafeAreaView, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; //expo secure store is a tool that offers a safe storage vault on the phone
//we will use this to save the JWT after a user logs in, in order for future requests to be authorized

export default function AuthScreen() {

    //react uses useState to keep and quickly change the state of a variable and load it on the screen
    //we can see the syntax: we have a variable that holds the data, and a function that is called when the state changes
    //so, when a user types D for the username, an event fires and setUsername('D') is called
    //D is saved into memory in username and quickly redraws the screen so the user sees D
    //then, the user types 'a' and setUsername ('Da') is called
    const [isLogin, setIsLogin] = useState(true); //the default state is true
    const [username, setUsername] = useState(''); //the default state is ''
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    //we don't need to write the set functions
    //but we will see than we can use them how we want (for setIsLogin)

    //momentary placeholder for submit button, will be replaced with backend call
    const handleSubmit = async () => {
        const baseUrl = 'http://192.168.1.105:8080/api/auth';
        try {
            if (isLogin) {
                const response = await axios.post(`${baseUrl}/login`, { username, password });
                console.log('Log in successful');
                alert('Successfully logged in!'); //alert on phone
                //console.log(response.data);

                //after a user logs in, we need to saave their JWT on the safe storage vault on the phone
                const token = response.data.access_token;
                SecureStore.setItemAsync('token', token);
            } else {
                const response = await axios.post(`${baseUrl}/register`, { username, email, password });
                console.log('Register successful');
                alert('Successfully registered!');
            }


        } catch (error: any) {
            const errorMessage = error.response.data.message;
            console.error('Auth error: ', errorMessage);
            alert(errorMessage);
        }
    }

    return (
        //we use TouchableWithoutFeedback so the keyboard disappers when we press on the background
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.formContainer}>
                    {/* Title */}
                    <Text style={styles.title}>{isLogin ? 'Welcome back!' : 'Create account'}</Text>

                    {/*Username input*/}
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder='Username'
                        autoCapitalize='none'
                    />


                    {!isLogin && (<TextInput //email only appears on register page
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        placeholder='Email'
                    />)}

                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder='Password'
                        autoCapitalize='none'
                        secureTextEntry={true}
                    />

                    {/*TouchableOpacity represents something we can touch, we use it for a button (but the actual button is drawn using styles)
          Notice the onPress argument. When the button is pressed handleSubmit function is called */}
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>{isLogin ? 'Log in' : 'Sign up'}
                        </Text>
                    </TouchableOpacity>
                    {/*Same thing here, but for onPress, we have a lambda function that calls the setIsLogin function with !isLogin
          so, if we are on the login page (isLogin) it changes to register page (!isLogin) and vice-versa */}
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleContainer}>
                        <Text style={styles.toggleText}> {isLogin ? "Don't have an account? Sign up!" : "Already have an account? Log in?"}</Text>
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
        justifyContent: 'center',
    },
    formContainer: {
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
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
    toggleContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        color: '#007BFF',
        fontSize: 16,
    }
});