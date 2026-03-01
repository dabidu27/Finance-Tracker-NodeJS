//in Expo Router, creating a folder with the name in parantheses (ex: (tabs)) creates a "route group"
//it allows the screens inside this route group to share a common layout, without changing their url path
//in _layout.tsx, we create a common layout that tells expo to wrap the screens inside this folder with a bottom tab bar
//the navigation paths from the other files don't change, because (tabs) is a hidden group - Expo Rotuer is smart enough to find the files

import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; //built in in expo icons

export default function TabLayout() {

    return (

        <Tabs

            screenOptions={{ tabBarActiveTintColor: '#007BFF', headerShown: false }}
        >

            {/*1. Homescreen tab*/}

            <Tabs.Screen
                name="homescreen"
                options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }}
            //tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color}
            //for the tabBarIcon property we have an arrow function that takes the argument color and returns an Ionicons React component, using the color argument for its property
            //when each of the 2 screen we will have is active, tabBarActiveTintColor from the Tabs component above will be used
            //when we switch to the other screen, this color (a basic grey) will be used
            />

            <Tabs.Screen
                name="dashboard"
                options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name='pie-chart' size={24} color={color} /> }}
            />

        </Tabs>

    );


}