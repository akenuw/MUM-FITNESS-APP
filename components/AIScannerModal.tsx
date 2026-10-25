import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import {
  analyzeFoodWithGemini,
  FALLBACK_SCANNED_MEAL,
  ScannedNutritionResult,
} from '@/services/geminiFoodScanner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AIScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveMeal: (meal: {
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUri: string;
  }) => void;
}

export function AIScannerModal({ visible, onClose, onSaveMeal }: AIScannerModalProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Mode and view state: 'camera' | 'result'
  const [currentView, setCurrentView] = useState<'camera' | 'result'>('camera');
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [analyzing, setAnalyzing] = useState(false);

  // Scanned / Result State
  const [scannedImageUri, setScannedImageUri] = useState<string>('');
  const [mealCategory, setMealCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Breakfast');
  const [mealName, setMealName] = useState<string>('Kiwi Smoothie Bowl with Granola');
  const [baseCalories, setBaseCalories] = useState<number>(450);
  const [baseProtein, setBaseProtein] = useState<number>(20);
  const [baseCarbs, setBaseCarbs] = useState<number>(140);
  const [baseFat, setBaseFat] = useState<number>(12);
  const [servings, setServings] = useState<number>(1);

  // Edit Macro modal
  const [editingMacro, setEditingMacro] = useState<'calories' | 'protein' | 'carbs' | 'fat' | null>(null);
  const [tempMacroValue, setTempMacroValue] = useState<string>('');

  // Scanning laser animation
  const laserTranslateY = useSharedValue(0);

  useEffect(() => {
    if (analyzing) {
      laserTranslateY.value = withRepeat(
        withSequence(
          withTiming(SCREEN_WIDTH * 0.72, { duration: 1200 }),
          withTiming(0, { duration: 1200 })
        ),
        -1,
        true
      );
    } else {
      laserTranslateY.value = 0;
    }
  }, [analyzing]);

  const animatedLaserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserTranslateY.value }],
  }));

  const handleCapture = async () => {
    setAnalyzing(true);
    let capturedUri = '';
    let base64 = '';

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
        });
        if (photo?.uri) {
          capturedUri = photo.uri;
          base64 = photo.base64 || '';
        }
      }
    } catch (err) {
      console.log('Camera capture fallback:', err);
    }

    // Fallback image if simulator or camera unavailable
    if (!capturedUri) {
      const asset = Image.resolveAssetSource(require('@/assets/images/kiwi-smoothie-bowl.jpg'));
      capturedUri = asset.uri;
    }

    setScannedImageUri(capturedUri);

    try {
      const result: ScannedNutritionResult = await analyzeFoodWithGemini(capturedUri, base64);
      setMealCategory(result.mealCategory);
      setMealName(result.mealName);
      setBaseCalories(result.calories);
      setBaseProtein(result.proteinGrams);
      setBaseCarbs(result.carbsGrams);
      setBaseFat(result.fatGrams);
      setServings(1);
      setCurrentView('result');
    } catch (e) {
      console.warn('Gemini vision error:', e);
      setMealCategory('Breakfast');
      setMealName('Kiwi Smoothie Bowl with Granola');
      setBaseCalories(450);
      setBaseProtein(20);
      setBaseCarbs(140);
      setBaseFat(12);
      setServings(1);
      setCurrentView('result');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const picked = result.assets[0];
        setAnalyzing(true);
        setScannedImageUri(picked.uri);

        const analysis = await analyzeFoodWithGemini(picked.uri, picked.base64 || undefined);
        setMealCategory(analysis.mealCategory);
        setMealName(analysis.mealName);
        setBaseCalories(analysis.calories);
        setBaseProtein(analysis.proteinGrams);
        setBaseCarbs(analysis.carbsGrams);
        setBaseFat(analysis.fatGrams);
        setServings(1);
        setCurrentView('result');
      }
    } catch (e) {
      console.warn('Gallery pick error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDone = () => {
    onSaveMeal({
      type: mealCategory,
      name: mealName,
      calories: Math.round(baseCalories * servings),
      protein: Math.round(baseProtein * servings),
      carbs: Math.round(baseCarbs * servings),
      fat: Math.round(baseFat * servings),
      imageUri: scannedImageUri,
    });
    // Reset view
    setCurrentView('camera');
    onClose();
  };

  const cycleCategory = () => {
    const categories: ('Breakfast' | 'Lunch' | 'Dinner' | 'Snacks')[] = [
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snacks',
    ];
    const nextIdx = (categories.indexOf(mealCategory) + 1) % categories.length;
    setMealCategory(categories[nextIdx]);
  };

  const handleSaveEditedMacro = () => {
    const val = parseInt(tempMacroValue) || 0;
    if (editingMacro === 'calories') setBaseCalories(Math.max(1, Math.round(val / servings)));
    if (editingMacro === 'protein') setBaseProtein(Math.max(0, Math.round(val / servings)));
    if (editingMacro === 'carbs') setBaseCarbs(Math.max(0, Math.round(val / servings)));
    if (editingMacro === 'fat') setBaseFat(Math.max(0, Math.round(val / servings)));
    setEditingMacro(null);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ============================================================ */}
      {/* SCREEN A: LIVE AI CAMERA SCANNER VIEW                         */}
      {/* ============================================================ */}
      {currentView === 'camera' && (
        <View style={styles.cameraContainer}>
          {/* Live Camera Viewfinder or Placeholder fallback */}
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={flashMode === 'on'}
            />
          ) : (
            <View style={styles.cameraPermissionFallback}>
              <Image
                source={require('@/assets/images/kiwi-smoothie-bowl.jpg')}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={styles.permissionOverlay}>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.permissionBtnText}>Enable Camera Preview</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 1. Top Translucent Overlay Header */}
          <View style={[styles.topOverlayHeader, { top: Math.max(insets.top, 14) + 10 }]}>
            {/* Left Close Button (✕) */}
            <TouchableOpacity style={styles.frostedHeaderBtn} activeOpacity={0.8} onPress={onClose}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Center Title */}
            <Text style={styles.headerTitleText}>AI Scaner</Text>

            {/* Right Options Button (•••) */}
            <TouchableOpacity
              style={styles.frostedHeaderBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Options', 'AI Scanner uses Google Gemini Vision to estimate meal macros.')}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* 2. Center Viewfinder Reticle (4 Curved White Corner Brackets) */}
          <View style={styles.reticleWrapper} pointerEvents="none">
            <View style={styles.reticleBox}>
              {/* Corner 1: Top-Left */}
              <View style={[styles.cornerBracket, styles.bracketTL]} />
              {/* Corner 2: Top-Right */}
              <View style={[styles.cornerBracket, styles.bracketTR]} />
              {/* Corner 3: Bottom-Left */}
              <View style={[styles.cornerBracket, styles.bracketBL]} />
              {/* Corner 4: Bottom-Right */}
              <View style={[styles.cornerBracket, styles.bracketBR]} />

              {/* Scanning Laser Line when analyzing */}
              {analyzing && (
                <Animated.View style={[styles.laserSweepLine, animatedLaserStyle]} />
              )}
            </View>

            {analyzing && (
              <View style={styles.analyzingPill}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.analyzingText}>Analyzing meal with AI...</Text>
              </View>
            )}
          </View>

          {/* 3. Floating Mode Switcher Bar */}
          <View style={[styles.modeSwitcherBar, { bottom: Math.max(insets.bottom, 16) + 98 }]}>
            {/* Active Pill — AI Camera */}
            <View style={styles.activeModePill}>
              <Ionicons name="camera-outline" size={16} color="#16181A" />
              <Text style={styles.activeModeText}>AI Camera</Text>
            </View>

            {/* Inactive Icon 2 — Barcode Scanner */}
            <TouchableOpacity
              style={styles.inactiveModeBtn}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Barcode Scanner', 'Align packaged food barcode inside the frame.')}
            >
              <MaterialCommunityIcons name="barcode-scan" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Inactive Icon 3 — Nutrition Label / Picture Mode */}
            <TouchableOpacity
              style={styles.inactiveModeBtn}
              activeOpacity={0.7}
              onPress={handlePickFromGallery}
            >
              <Ionicons name="image-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* 4. Bottom Camera Controls Row (Flash, Shutter, Gallery) */}
          <View style={[styles.bottomControlsRow, { bottom: Math.max(insets.bottom, 16) + 16 }]}>
            {/* Flash Toggle */}
            <TouchableOpacity
              style={styles.controlCircleBtn}
              activeOpacity={0.8}
              onPress={() => setFlashMode(flashMode === 'on' ? 'off' : 'on')}
            >
              <Ionicons
                name={flashMode === 'on' ? 'flash' : 'flash-off-outline'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Primary AI Shutter Button */}
            <TouchableOpacity
              style={styles.shutterOuterRing}
              activeOpacity={0.85}
              onPress={handleCapture}
              disabled={analyzing}
            >
              <View style={styles.shutterInnerCircle}>
                {analyzing ? (
                  <ActivityIndicator size="small" color="#68B984" />
                ) : (
                  <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    {/* Reticle frame brackets */}
                    <Path
                      d="M6 3H4C3.4 3 3 3.4 3 4V6M18 3H20C20.6 3 21 3.4 21 4V6M6 21H4C3.4 21 3 20.6 3 20V18M18 21H20C20.6 21 21 20.6 21 20V18"
                      stroke="#68B984"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {/* Tiny centered bowl */}
                    <Path
                      d="M7.5 12C7.5 14.5 9.5 16.5 12 16.5C14.5 16.5 16.5 14.5 16.5 12H7.5Z"
                      fill="#68B984"
                    />
                    <Circle cx="12" cy="10" r="1.5" fill="#68B984" />
                  </Svg>
                )}
              </View>
            </TouchableOpacity>

            {/* Gallery Photo Picker */}
            <TouchableOpacity
              style={styles.controlCircleBtn}
              activeOpacity={0.8}
              onPress={handlePickFromGallery}
              disabled={analyzing}
            >
              <Ionicons name="grid-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ============================================================ */}
      {/* SCREEN B: SCANNED MEAL NUTRITION RESULT & EDITOR SHEET       */}
      {/* ============================================================ */}
      {currentView === 'result' && (
        <View style={styles.resultContainer}>
          {/* Top Half: Captured Food Photo Header (46% height) */}
          <View style={styles.capturedPhotoHeader}>
            <Image
              source={
                scannedImageUri
                  ? { uri: scannedImageUri }
                  : require('@/assets/images/kiwi-smoothie-bowl.jpg')
              }
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />

            {/* Floating Top Header Controls */}
            <View style={[styles.topOverlayHeader, { top: Math.max(insets.top, 14) + 10 }]}>
              {/* Back to scanner */}
              <TouchableOpacity
                style={styles.frostedHeaderBtn}
                activeOpacity={0.8}
                onPress={() => setCurrentView('camera')}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View />

              {/* Options */}
              <TouchableOpacity
                style={styles.frostedHeaderBtn}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Meal Options', 'Detected with Gemini Vision AI.')}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Half: Overlapping Rounded Nutrition Sheet */}
          <View
            style={[
              styles.nutritionSheet,
              { paddingBottom: Math.max(insets.bottom, 16) + 12 },
            ]}
          >
            {/* Top Row: Category Label + Title + Serving Stepper */}
            <View style={styles.sheetHeaderRow}>
              <View style={styles.titleColumn}>
                <TouchableOpacity onPress={cycleCategory} activeOpacity={0.7}>
                  <Text style={styles.categoryLabel}>{mealCategory} ▾</Text>
                </TouchableOpacity>
                <Text style={styles.dishTitleText} numberOfLines={2}>
                  {mealName}
                </Text>
              </View>

              {/* Serving Quantity Stepper Pill (- 1 +) */}
              <View style={styles.stepperPill}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setServings(Math.max(1, servings - 1))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.stepperMinusText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.stepperValueText}>{servings}</Text>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setServings(servings + 1)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.stepperPlusText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2x2 Editable Macronutrient Bento Grid */}
            <View style={styles.bentoGrid}>
              {/* Row 1 */}
              <View style={styles.bentoRow}>
                {/* Top-Left: Calories */}
                <TouchableOpacity
                  style={styles.macroCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    setEditingMacro('calories');
                    setTempMacroValue(String(Math.round(baseCalories * servings)));
                  }}
                >
                  <View style={styles.macroCardTop}>
                    <View style={styles.macroIconLabel}>
                      <Ionicons name="flame" size={15} color="#F5B73B" />
                      <Text style={[styles.macroLabelText, { color: '#F5B73B' }]}>Calories</Text>
                    </View>
                    <Text style={styles.macroEditText}>Edit</Text>
                  </View>
                  <Text style={styles.macroBigValue}>{Math.round(baseCalories * servings)}</Text>
                </TouchableOpacity>

                {/* Top-Right: Protein */}
                <TouchableOpacity
                  style={styles.macroCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    setEditingMacro('protein');
                    setTempMacroValue(String(Math.round(baseProtein * servings)));
                  }}
                >
                  <View style={styles.macroCardTop}>
                    <View style={styles.macroIconLabel}>
                      <MaterialCommunityIcons name="cube-outline" size={14} color="#49A6E9" />
                      <Text style={[styles.macroLabelText, { color: '#49A6E9' }]}>Protein</Text>
                    </View>
                    <Text style={styles.macroEditText}>Edit</Text>
                  </View>
                  <Text style={styles.macroBigValue}>{Math.round(baseProtein * servings)}gm</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2 */}
              <View style={styles.bentoRow}>
                {/* Bottom-Left: Carbs */}
                <TouchableOpacity
                  style={styles.macroCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    setEditingMacro('carbs');
                    setTempMacroValue(String(Math.round(baseCarbs * servings)));
                  }}
                >
                  <View style={styles.macroCardTop}>
                    <View style={styles.macroIconLabel}>
                      <Ionicons name="nutrition-outline" size={14} color="#7B4B94" />
                      <Text style={[styles.macroLabelText, { color: '#7B4B94' }]}>Carbs</Text>
                    </View>
                    <Text style={styles.macroEditText}>Edit</Text>
                  </View>
                  <Text style={styles.macroBigValue}>{Math.round(baseCarbs * servings)}gm</Text>
                </TouchableOpacity>

                {/* Bottom-Right: Fat */}
                <TouchableOpacity
                  style={styles.macroCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    setEditingMacro('fat');
                    setTempMacroValue(String(Math.round(baseFat * servings)));
                  }}
                >
                  <View style={styles.macroCardTop}>
                    <View style={styles.macroIconLabel}>
                      <Ionicons name="leaf-outline" size={14} color="#68B984" />
                      <Text style={[styles.macroLabelText, { color: '#68B984' }]}>Fat</Text>
                    </View>
                    <Text style={styles.macroEditText}>Edit</Text>
                  </View>
                  <Text style={styles.macroBigValue}>{Math.round(baseFat * servings)}gm</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Full-Width Black Done Button */}
            <TouchableOpacity style={styles.doneButton} activeOpacity={0.88} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Single Macro Value Modal */}
      <Modal visible={editingMacro !== null} animationType="fade" transparent>
        <View style={styles.editMacroBackdrop}>
          <View style={styles.editMacroCard}>
            <Text style={styles.editMacroTitle}>
              Edit {editingMacro ? editingMacro.charAt(0).toUpperCase() + editingMacro.slice(1) : ''}
            </Text>
            <TextInput
              style={styles.editMacroInput}
              keyboardType="number-pad"
              value={tempMacroValue}
              onChangeText={setTempMacroValue}
              autoFocus
            />
            <View style={styles.editMacroBtnsRow}>
              <TouchableOpacity
                style={styles.editMacroCancelBtn}
                onPress={() => setEditingMacro(null)}
              >
                <Text style={styles.editMacroCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editMacroSaveBtn} onPress={handleSaveEditedMacro}>
                <Text style={styles.editMacroSaveText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* Screen A: Camera */
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  cameraPermissionFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1E1E1E',
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  topOverlayHeader: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  frostedHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(30, 30, 30, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  reticleWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleBox: {
    width: SCREEN_WIDTH * 0.78,
    height: SCREEN_WIDTH * 0.78,
    position: 'relative',
    marginTop: -40,
  },
  cornerBracket: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderColor: '#FFFFFF',
  },
  bracketTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 28,
  },
  bracketTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 28,
  },
  bracketBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 28,
  },
  bracketBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 28,
  },
  laserSweepLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#68B984',
    shadowColor: '#68B984',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  analyzingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modeSwitcherBar: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 35, 30, 0.42)',
    borderRadius: 999,
    padding: 4,
    gap: 6,
    zIndex: 10,
  },
  activeModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 6,
  },
  activeModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16181A',
  },
  inactiveModeBtn: {
    width: 36,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControlsRow: {
    position: 'absolute',
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  controlCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 30, 30, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Screen B: Scanned Result Sheet */
  resultContainer: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  capturedPhotoHeader: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.46,
    position: 'relative',
  },
  nutritionSheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: '#F5F6F8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    justifyContent: 'space-between',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleColumn: {
    flex: 1,
    paddingRight: 12,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#8E929B',
    fontWeight: '500',
  },
  dishTitleText: {
    fontSize: 21,
    fontWeight: '700',
    color: '#16181A',
    lineHeight: 27,
    marginTop: 4,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stepperBtn: {
    paddingHorizontal: 4,
  },
  stepperMinusText: {
    fontSize: 16,
    color: '#5A5E66',
    fontWeight: '500',
  },
  stepperValueText: {
    fontSize: 14,
    color: '#16181A',
    fontWeight: '700',
  },
  stepperPlusText: {
    fontSize: 16,
    color: '#16181A',
    fontWeight: '600',
  },
  bentoGrid: {
    gap: 12,
    marginTop: 14,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    minHeight: 88,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  macroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  macroLabelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  macroEditText: {
    fontSize: 11,
    color: '#8E929B',
    fontWeight: '400',
  },
  macroBigValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16181A',
    marginTop: 6,
  },
  doneButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#16181A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Macro Inline Edit Modal */
  editMacroBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  editMacroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  editMacroTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16181A',
    marginBottom: 12,
  },
  editMacroInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#16181A',
    marginBottom: 16,
  },
  editMacroBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editMacroCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editMacroCancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  editMacroSaveBtn: {
    backgroundColor: '#16181A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  editMacroSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
