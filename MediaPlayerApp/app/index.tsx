import { View, SafeAreaView, Text, Pressable, StyleSheet } from "react-native";
import { Link } from 'expo-router';



export default function HomePage() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.sectionTitle}>Welcome to the Media Player App</Text>
            <View style={styles.uploadButton}>
                <Link href='/media_player' asChild>
                    <Pressable><Text style={styles.uploadButtonText}>Click to Get Started</Text></Pressable>
                </Link>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      margin: 16,
    },
    uploadButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    fileList: {
      flex: 1,
    },
    audioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    thumbnail: {
      width: 50,
      height: 50,
      borderRadius: 4,
      marginRight: 12,
    },
    audioInfo: {
      flex: 1,
      marginRight: 12,
    },
    audioTitle: {
      fontSize: 16,
    },
    audioDuration: {
      fontSize: 14,
      color: '#666',
    },
    playbackControls: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    currentImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nowPlaying: {
      fontSize: 16,
      flex: 1,
    },
  });