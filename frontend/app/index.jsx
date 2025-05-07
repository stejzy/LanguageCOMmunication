import { Redirect } from "expo-router";
import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';

export default function Index() {
  const {authState} = useContext(AuthContext);

  if (authState.loading) {
    console.log(123);
    return null;
  }

  console.log(123);
  console.log(authState.authenticated)

  // return ( <>
  //   !authState?.authenticated ? 
  //   <Redirect href="/login" /> : 
  //   <Redirect href="/"/> ;
  //   </>
  // )
  return authState?.authenticated ? 
    <Redirect href="/(tabs)/translation" /> :
    <Redirect href="/login" />;
}