import { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import { lookupBarcode, addPantryItem } from '../lib/api';

const UNIT_OPTIONS = [
    'count', 'gram', 'ounce', 'pound',
    'milliliter', 'liter', 'gallon', 'cup', 'tablespoon', 'teaspoon'
];

export default function BarcodeScannerScreen({ session, onDone }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(true);
    const [lookingUp, setLookingUp] = useState(false);
    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);

    // Pantry form state
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState('count');
    const [expiryDate, setExpiryDate] = useState('');
    const [adding, setAdding] = useState(false);

    // Prevent multiple scans firing at once
    const lastScanned = useRef(null);

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.permissionText}>Camera access is needed to scan barcodes.</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }) => {
        // Debounce — ignore if same barcode scanned within 3 seconds
        if (!scanning || data === lastScanned.current) return;
        lastScanned.current = data;
        setScanning(false);
        setLookingUp(true);
        setNotFound(false);
        setProduct(null);

        try {
            const result = await lookupBarcode(session.access_token, data);
            setProduct(result);
            setUnit(result.default_unit ?? 'count');
        } catch (err) {
            if (err.message?.includes('not found') || err.message?.includes('404')) {
                setNotFound(true);
            } else {
                Alert.alert('Error', err.message || 'Failed to look up barcode');
                resetScanner();
            }
        } finally {
            setLookingUp(false);
        }
    };

    const handleAddToPantry = async () => {
        const quantityValue = Number(quantity);
        if (Number.isNaN(quantityValue) || quantityValue <= 0) {
            Alert.alert('Validation', 'Quantity must be greater than 0');
            return;
        }

        setAdding(true);
        try {
            await addPantryItem(session.access_token, {
                ingredient_id: product.ingredient_id,
                quantity: quantityValue,
                unit,
                expiry_date: expiryDate || null,
            });
            Alert.alert('Added!', `${product.product_name} added to your pantry.`, [
                { text: 'Scan Another', onPress: resetScanner },
                { text: 'Done', onPress: onDone },
            ]);
        } catch (err) {
            const msg = err.message || 'Failed to add to pantry';
            if (msg.toLowerCase().includes('already exists')) {
                Alert.alert('Duplicate', 'This ingredient is already in your pantry.');
            } else {
                Alert.alert('Error', msg);
            }
        } finally {
            setAdding(false);
        }
    };

    const resetScanner = () => {
        lastScanned.current = null;
        setProduct(null);
        setNotFound(false);
        setQuantity('1');
        setUnit('count');
        setExpiryDate('');
        setScanning(true);
    };

    // Product found — show confirm form
    if (product) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Product Found</Text>
                <View style={styles.productCard}>
                    <Text style={styles.productName}>{product.product_name}</Text>
                    {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
                    <Text style={styles.ingredientLabel}>Ingredient: {product.ingredient_name}</Text>
                </View>

                <Text style={styles.label}>Quantity</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                />

                <Text style={styles.label}>Unit</Text>
                <Picker
                    selectedValue={unit}
                    onValueChange={setUnit}
                    style={styles.picker}
                >
                    {UNIT_OPTIONS.map(u => <Picker.Item key={u} label={u} value={u} />)}
                </Picker>

                <Text style={styles.label}>Expiry Date (YYYY-MM-DD, optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 2025-12-31"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={[styles.button, adding && styles.buttonDisabled]}
                    onPress={handleAddToPantry}
                    disabled={adding}
                >
                    {adding
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Add to Pantry</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={resetScanner}>
                    <Text style={styles.secondaryButtonText}>Scan Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Barcode not found in any database
    if (notFound) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Product Not Found</Text>
                <Text style={styles.subtitle}>This barcode isn't in our database yet.</Text>
                <TouchableOpacity style={styles.button} onPress={resetScanner}>
                    <Text style={styles.buttonText}>Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={onDone}>
                    <Text style={styles.secondaryButtonText}>Add Manually</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Camera / loading state
    return (
        <View style={styles.scannerContainer}>
            <CameraView
                style={StyleSheet.absoluteFill}
                barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
                onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                <Text style={styles.overlayTitle}>Scan a barcode</Text>
                <View style={styles.scanFrame} />
                {lookingUp && (
                    <View style={styles.lookingUpBox}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.lookingUpText}>Looking up product...</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={onDone}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 24,
    },
    scanFrame: {
        width: 260,
        height: 160,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 12,
    },
    lookingUpBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 10,
    },
    lookingUpText: {
        color: '#fff',
        fontSize: 15,
    },
    cancelButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    productCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    productName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    brand: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    ingredientLabel: {
        fontSize: 14,
        color: '#374151',
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        marginTop: 12,
        color: '#374151',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        backgroundColor: '#fff',
    },
    picker: {
        marginTop: -8,
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 10,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        marginTop: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '500',
    },
    permissionText: {
        fontSize: 15,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 20,
    },
});
