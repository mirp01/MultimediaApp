import * as SQLite from 'expo-sqlite';
import { AudioFile, ImageFile } from '@/constants/types';

export const initDatabase = async () => {
    const db = await SQLite.openDatabaseAsync('mediafiles');
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS audio_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL,
        duration INTEGER
        );
        CREATE TABLE IF NOT EXISTS image_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL
        );
    `);
    return db;
};

export const saveAudioFile = async (db: SQLite.SQLiteDatabase, title: string, file_path: string, duration: number | undefined) => {
    const durationValue = duration === undefined ? null : duration;
    const result = await db.runAsync(
        'INSERT INTO audio_files (title, file_path, duration) VALUES (?, ?, ?)',
        [title, file_path, durationValue]
    );
    return result.lastInsertRowId;
};

export const saveImageFile = async (db: SQLite.SQLiteDatabase, title: string, file_path: string) => {
    const result = await db.runAsync(
        'INSERT INTO image_files (title, file_path) VALUES (?, ?)',
        [title, file_path]
    );
    return result.lastInsertRowId;
};

export const getAudioFiles = async (db: SQLite.SQLiteDatabase): Promise<AudioFile[]> => {
    return await db.getAllAsync<AudioFile>('SELECT * FROM audio_files ORDER BY id ASC');
};

export const getImageFiles = async (db: SQLite.SQLiteDatabase): Promise<ImageFile[]> => {
    return await db.getAllAsync<ImageFile>('SELECT * FROM image_files ORDER BY id ASC');
};

export const deleteAudioFile = async (db: SQLite.SQLiteDatabase, id: number) => {
    await db.runAsync('DELETE FROM audio_files WHERE id = ?', [id]);
};

export const deleteImageFile = async (db: SQLite.SQLiteDatabase, id: number) => {
    await db.runAsync('DELETE FROM image_files WHERE id = ?', [id]);
};

export const clearAllData = async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM audio_files');
    await db.runAsync('DELETE FROM image_files');
};