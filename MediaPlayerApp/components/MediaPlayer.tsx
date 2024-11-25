import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { AudioFile, ImageFile } from '@/constants/types';
import { initDatabase, saveAudioFile, getAudioFiles, saveImageFile, getImageFiles, clearAllData } from '@/constants/database';

const MediaPlayer: React.FC = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null);
  const [currentImage, setCurrentImage] = useState<ImageFile | null>(null);

  // Initialize database and load files
  useEffect(() => {
    const setup = async () => {
      const database = await initDatabase();
      setDb(database);
      loadFiles(database);
    };
    setup();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadFiles = async (database: SQLite.SQLiteDatabase) => {
    const audio = await getAudioFiles(database);
    const images = await getImageFiles(database);
    setAudioFiles(audio);
    setImageFiles(images);
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.name;
        const newPath = `${FileSystem.documentDirectory}audio/${fileName}`;
        
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}audio`, {
          intermediates: true,
        });
        
        await FileSystem.copyAsync({
          from: asset.uri,
          to: newPath,
        });

        if (db) {
          const { sound: tempSound } = await Audio.Sound.createAsync(
            { uri: newPath },
            { shouldPlay: false }
          );
          const status = await tempSound.getStatusAsync();
          let duration: number | undefined = undefined;
          
          if ('durationMillis' in status && status.durationMillis) {
            duration = status.durationMillis;
          }
          
          await tempSound.unloadAsync();

          const audioId = await saveAudioFile(db, fileName, newPath, duration);
          loadFiles(db);

          // Prompt for image upload after audio is saved
          pickImageFile(audioId);
        }
      }
    } catch (error) {
      console.error('Error picking audio:', error);
    }
  };

  const pickImageFile = async (audioId: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = `${audioId}_${asset.name}`;
        const newPath = `${FileSystem.documentDirectory}images/${fileName}`;
        
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, {
          intermediates: true,
        });
        
        await FileSystem.copyAsync({
          from: asset.uri,
          to: newPath,
        });

        if (db) {
          await saveImageFile(db, fileName, newPath);
          loadFiles(db);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const playAudio = async (audio: AudioFile) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audio.file_path },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setCurrentAudio(audio);

      // Find corresponding image
      const matchingImage = imageFiles.find(img => 
        img.title.startsWith(`${audio.id}_`)
      );
      setCurrentImage(matchingImage || null);

      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if ('isLoaded' in status && status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeAudio = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const renderAudioItem = ({ item }: { item: AudioFile }) => {
    const matchingImage = imageFiles.find(img => 
      img.title.startsWith(`${item.id}_`)
    );

    return (
      <TouchableOpacity
        style={styles.audioItem}
        onPress={() => playAudio(item)}
      >
        {matchingImage && (
          <Image 
            source={{ uri: matchingImage.file_path }}
            style={styles.thumbnail}
          />
        )}
        <View style={styles.audioInfo}>
          <Text style={styles.audioTitle}>{item.title}</Text>
          <Text style={styles.audioDuration}>
            {item.duration ? `${Math.floor(Number(item.duration) / 1000)}s` : 'Unknown duration'}
          </Text>
        </View>
        <MaterialIcons 
          name={currentAudio?.id === item.id && isPlaying ? 'pause' : 'play-arrow'} 
          size={24} 
          color="black" 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={pickAudioFile}
      >
        <Text style={styles.uploadButtonText}>Upload Audio File</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Audio Files</Text>
      <FlatList
        data={audioFiles}
        renderItem={renderAudioItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.fileList}
      />

      {currentAudio && (
        <View style={styles.playbackControls}>
          {currentImage && (
            <Image 
              source={{ uri: currentImage.file_path }}
              style={styles.currentImage}
            />
          )}
          <View style={styles.controlsContainer}>
            <Text style={styles.nowPlaying}>
              Now Playing: {currentAudio.title}
            </Text>
            <TouchableOpacity
              onPress={isPlaying ? pauseAudio : resumeAudio}
            >
              <MaterialIcons 
                name={isPlaying ? 'pause' : 'play-arrow'} 
                size={32} 
                color="black" 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <TouchableOpacity 
  style={[styles.uploadButton, { backgroundColor: 'red' }]}
  onPress={async () => {
    if (db) {
      if (sound) {
        await sound.unloadAsync();
      }
      await clearAllData(db);
      setAudioFiles([]);
      setImageFiles([]);
      setCurrentAudio(null);
      setCurrentImage(null);
      setSound(null);
      setIsPlaying(false);
      alert('Database cleared');
    }
  }}
>
  <Text style={styles.uploadButtonText}>Clear All Data</Text>
</TouchableOpacity>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
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

export default MediaPlayer;