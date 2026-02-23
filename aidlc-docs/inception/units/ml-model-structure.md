# ML Model Structure Specification - Household Spending Tracker

## Overview
Complete machine learning model architecture specification for transaction classification. This document defines the TensorFlow.js neural network model, feature extraction, training process, and evaluation metrics.

---

## Model Architecture

### Neural Network Structure

```typescript
/**
 * Neural Network Architecture for Transaction Classification
 * 
 * Model Type: Multi-class Classification Neural Network
 * Framework: TensorFlow.js
 * Input: Text features from transaction data
 * Output: Category probabilities
 */

// Model Configuration
const MODEL_CONFIG = {
  // Input layer
  inputShape: [100],  // 100-dimensional feature vector
  
  // Hidden layers
  hiddenLayers: [
    { units: 64, activation: 'relu', dropout: 0.3 },
    { units: 32, activation: 'relu', dropout: 0.2 }
  ],
  
  // Output layer
  outputUnits: null,  // Dynamic based on number of categories
  outputActivation: 'softmax',
  
  // Compilation
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
};
```

### Layer Details

#### 1. Input Layer
- **Shape**: `[batchSize, 100]`
- **Description**: 100-dimensional feature vector extracted from transaction text
- **Features**: TF-IDF vectors from payee and particulars fields

#### 2. First Hidden Layer
- **Units**: 64 neurons
- **Activation**: ReLU (Rectified Linear Unit)
- **Dropout**: 0.3 (30% dropout for regularization)
- **Purpose**: Learn high-level patterns from input features

#### 3. Second Hidden Layer
- **Units**: 32 neurons
- **Activation**: ReLU
- **Dropout**: 0.2 (20% dropout)
- **Purpose**: Learn more abstract representations

#### 4. Output Layer
- **Units**: Dynamic (equal to number of categories)
- **Activation**: Softmax
- **Purpose**: Produce probability distribution over categories

---

## TensorFlow.js Implementation

### Model Creation

```typescript
import * as tf from '@tensorflow/tfjs-node';

/**
 * Create and compile the classification model
 * 
 * @param numCategories - Number of output categories
 * @returns Compiled TensorFlow.js model
 */
export function createModel(numCategories: number): tf.LayersModel {
  const model = tf.sequential();
  
  // Input layer (implicit)
  // First hidden layer
  model.add(tf.layers.dense({
    inputShape: [100],
    units: 64,
    activation: 'relu',
    kernelInitializer: 'heNormal',
    name: 'dense_1'
  }));
  
  // Dropout for regularization
  model.add(tf.layers.dropout({
    rate: 0.3,
    name: 'dropout_1'
  }));
  
  // Second hidden layer
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu',
    kernelInitializer: 'heNormal',
    name: 'dense_2'
  }));
  
  // Dropout for regularization
  model.add(tf.layers.dropout({
    rate: 0.2,
    name: 'dropout_2'
  }));
  
  // Output layer
  model.add(tf.layers.dense({
    units: numCategories,
    activation: 'softmax',
    kernelInitializer: 'glorotNormal',
    name: 'output'
  }));
  
  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),  // Learning rate: 0.001
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
}
```

---

## Feature Extraction

### Input Features

The model uses three primary text fields from transactions:
1. **Payee**: Merchant or payee name
2. **Particulars**: Additional transaction details
3. **Tran Type**: Transaction type (POS, FT, AP, etc.)

### Feature Extraction Pipeline

```typescript
/**
 * Feature extraction configuration
 */
export const FEATURE_CONFIG = {
  // Text preprocessing
  lowercase: true,
  removeSpecialChars: true,
  removeNumbers: false,
  
  // Tokenization
  maxTokens: 1000,  // Vocabulary size
  
  // TF-IDF
  maxFeatures: 100,  // Output feature vector size
  minDocFreq: 2,     // Minimum document frequency
  maxDocFreq: 0.8,   // Maximum document frequency (80%)
  
  // N-grams
  ngramRange: [1, 2]  // Unigrams and bigrams
};

/**
 * Extract features from transaction text
 * 
 * @param transaction - Transaction to extract features from
 * @returns Feature vector (100-dimensional)
 */
export function extractFeatures(transaction: Transaction): number[] {
  // Combine text fields
  const text = [
    transaction.payee,
    transaction.particulars || '',
    transaction.tranType || ''
  ].join(' ');
  
  // Preprocess text
  const preprocessed = preprocessText(text);
  
  // Tokenize
  const tokens = tokenize(preprocessed);
  
  // Convert to TF-IDF vector
  const tfidfVector = computeTFIDF(tokens);
  
  // Pad or truncate to 100 dimensions
  return padVector(tfidfVector, 100);
}

/**
 * Preprocess text for feature extraction
 */
function preprocessText(text: string): string {
  let processed = text.toLowerCase();
  processed = processed.replace(/[^a-z0-9\s]/g, ' ');  // Remove special chars
  processed = processed.replace(/\s+/g, ' ').trim();   // Normalize whitespace
  return processed;
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text.split(' ').filter(token => token.length > 0);
}
```

---

### TF-IDF Vectorization

```typescript
/**
 * TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer
 */
export class TFIDFVectorizer {
  private vocabulary: Map<string, number>;
  private idfScores: Map<string, number>;
  private maxFeatures: number;
  
  constructor(maxFeatures: number = 100) {
    this.vocabulary = new Map();
    this.idfScores = new Map();
    this.maxFeatures = maxFeatures;
  }
  
  /**
   * Fit vectorizer on training data
   * 
   * @param documents - Array of text documents
   */
  fit(documents: string[]): void {
    // Build vocabulary
    const termCounts = new Map<string, number>();
    const docCounts = new Map<string, number>();
    
    documents.forEach(doc => {
      const tokens = new Set(tokenize(preprocessText(doc)));
      tokens.forEach(token => {
        termCounts.set(token, (termCounts.get(token) || 0) + 1);
        docCounts.set(token, (docCounts.get(token) || 0) + 1);
      });
    });
    
    // Select top features by term frequency
    const sortedTerms = Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.maxFeatures);
    
    // Build vocabulary and compute IDF scores
    sortedTerms.forEach(([term, _], index) => {
      this.vocabulary.set(term, index);
      const docFreq = docCounts.get(term) || 0;
      const idf = Math.log((documents.length + 1) / (docFreq + 1)) + 1;
      this.idfScores.set(term, idf);
    });
  }
  
  /**
   * Transform text to TF-IDF vector
   * 
   * @param text - Text to transform
   * @returns TF-IDF feature vector
   */
  transform(text: string): number[] {
    const vector = new Array(this.maxFeatures).fill(0);
    const tokens = tokenize(preprocessText(text));
    
    // Compute term frequencies
    const termFreqs = new Map<string, number>();
    tokens.forEach(token => {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    });
    
    // Compute TF-IDF scores
    termFreqs.forEach((tf, term) => {
      const index = this.vocabulary.get(term);
      if (index !== undefined) {
        const idf = this.idfScores.get(term) || 0;
        vector[index] = tf * idf;
      }
    });
    
    // Normalize vector (L2 normalization)
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      return vector.map(val => val / norm);
    }
    
    return vector;
  }
}
```

---

## Training Process

### Training Configuration

```typescript
/**
 * Training hyperparameters
 */
export const TRAINING_CONFIG = {
  // Data split
  validationSplit: 0.2,  // 20% for validation
  
  // Training parameters
  epochs: 50,
  batchSize: 32,
  
  // Early stopping
  patience: 5,  // Stop if no improvement for 5 epochs
  minDelta: 0.001,  // Minimum improvement threshold
  
  // Learning rate
  initialLearningRate: 0.001,
  learningRateDecay: 0.95,  // Decay by 5% each epoch
  
  // Regularization
  l2Regularization: 0.01,
  
  // Minimum training samples
  minTrainingSamples: 10
};
```

---

### Training Implementation

```typescript
/**
 * Train the classification model
 * 
 * @param trainingData - Classification history data
 * @param categories - List of categories
 * @returns Trained model and metadata
 */
export async function trainModel(
  trainingData: ClassificationHistoryEntry[],
  categories: Category[]
): Promise<{ model: tf.LayersModel; metadata: MLModelMetadata }> {
  
  // Validate minimum training samples
  if (trainingData.length < TRAINING_CONFIG.minTrainingSamples) {
    throw new Error(`Insufficient training data. Need at least ${TRAINING_CONFIG.minTrainingSamples} samples.`);
  }
  
  // Prepare features and labels
  const { features, labels } = prepareTrainingData(trainingData, categories);
  
  // Create model
  const model = createModel(categories.length);
  
  // Convert to tensors
  const xTrain = tf.tensor2d(features);
  const yTrain = tf.tensor2d(labels);
  
  // Configure callbacks
  const callbacks = {
    onEpochEnd: (epoch: number, logs: any) => {
      console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
    },
    earlyStopping: tf.callbacks.earlyStopping({
      monitor: 'val_loss',
      patience: TRAINING_CONFIG.patience,
      minDelta: TRAINING_CONFIG.minDelta
    })
  };
  
  // Train model
  const history = await model.fit(xTrain, yTrain, {
    epochs: TRAINING_CONFIG.epochs,
    batchSize: TRAINING_CONFIG.batchSize,
    validationSplit: TRAINING_CONFIG.validationSplit,
    callbacks: callbacks,
    shuffle: true
  });
  
  // Clean up tensors
  xTrain.dispose();
  yTrain.dispose();
  
  // Extract training metrics
  const trainingAccuracy = history.history.acc[history.history.acc.length - 1];
  const validationAccuracy = history.history.val_acc[history.history.val_acc.length - 1];
  
  // Create metadata
  const metadata: MLModelMetadata = {
    id: 0,  // Will be set by repository
    modelVersion: generateModelVersion(),
    modelFilePath: './models/classifier_latest.json',
    modelType: 'neural_network',
    trainingSamplesCount: trainingData.length,
    trainingAccuracy: trainingAccuracy,
    validationAccuracy: validationAccuracy,
    lastTrainedAt: new Date(),
    confidenceThreshold: TRAINING_CONFIG.confidenceThreshold || 0.8,
    featureExtractionMethod: 'tfidf',
    modelParameters: {
      hiddenLayers: MODEL_CONFIG.hiddenLayers,
      optimizer: MODEL_CONFIG.optimizer,
      epochs: TRAINING_CONFIG.epochs,
      batchSize: TRAINING_CONFIG.batchSize
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return { model, metadata };
}

/**
 * Prepare training data (features and labels)
 */
function prepareTrainingData(
  trainingData: ClassificationHistoryEntry[],
  categories: Category[]
): { features: number[][]; labels: number[][] } {
  
  // Create category ID to index mapping
  const categoryIdToIndex = new Map<number, number>();
  categories.forEach((cat, index) => {
    categoryIdToIndex.set(cat.id, index);
  });
  
  // Extract features and labels
  const features: number[][] = [];
  const labels: number[][] = [];
  
  trainingData.forEach(entry => {
    // Extract features from transaction text
    const featureVector = extractFeatures({
      payee: entry.payee,
      particulars: entry.particulars,
      tranType: entry.tranType
    } as Transaction);
    
    // Create one-hot encoded label
    const categoryIndex = categoryIdToIndex.get(entry.categoryId);
    if (categoryIndex !== undefined) {
      const label = new Array(categories.length).fill(0);
      label[categoryIndex] = 1;
      
      features.push(featureVector);
      labels.push(label);
    }
  });
  
  return { features, labels };
}
```

---

## Prediction

### Classification Implementation

```typescript
/**
 * Classify a transaction using the trained model
 * 
 * @param model - Trained TensorFlow.js model
 * @param transaction - Transaction to classify
 * @param categories - List of categories
 * @returns Classification result with confidence score
 */
export async function classifyTransaction(
  model: tf.LayersModel,
  transaction: Transaction,
  categories: Category[]
): Promise<ClassificationResult> {
  
  // Extract features
  const features = extractFeatures(transaction);
  
  // Convert to tensor
  const inputTensor = tf.tensor2d([features]);
  
  // Make prediction
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const probabilities = await prediction.data();
  
  // Clean up tensors
  inputTensor.dispose();
  prediction.dispose();
  
  // Find category with highest probability
  let maxProb = 0;
  let maxIndex = 0;
  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] > maxProb) {
      maxProb = probabilities[i];
      maxIndex = i;
    }
  }
  
  const suggestedCategory = categories[maxIndex];
  const confidenceScore = maxProb;
  const shouldAutoApprove = confidenceScore >= TRAINING_CONFIG.confidenceThreshold;
  
  // Generate explanation
  const explanation = generateExplanation(
    transaction,
    suggestedCategory,
    confidenceScore
  );
  
  return {
    transactionId: transaction.id,
    suggestedCategoryId: suggestedCategory.id,
    confidenceScore: confidenceScore,
    shouldAutoApprove: shouldAutoApprove,
    explanation: explanation,
    features: { featureVector: features },
    transaction: transaction,
    suggestedCategory: suggestedCategory
  };
}

/**
 * Generate human-readable explanation for classification
 */
function generateExplanation(
  transaction: Transaction,
  category: Category,
  confidence: number
): string {
  const confidencePercent = (confidence * 100).toFixed(0);
  return `Classified as "${category.name}" with ${confidencePercent}% confidence based on payee "${transaction.payee}"`;
}
```

---

## Model Persistence

### Save Model

```typescript
/**
 * Save model to disk
 * 
 * @param model - TensorFlow.js model to save
 * @param filePath - Path to save model
 */
export async function saveModel(
  model: tf.LayersModel,
  filePath: string
): Promise<void> {
  const savePath = `file://${filePath}`;
  await model.save(savePath);
  console.log(`Model saved to ${filePath}`);
}
```

---

### Load Model

```typescript
/**
 * Load model from disk
 * 
 * @param filePath - Path to model file
 * @returns Loaded TensorFlow.js model
 */
export async function loadModel(filePath: string): Promise<tf.LayersModel> {
  const loadPath = `file://${filePath}/model.json`;
  const model = await tf.loadLayersModel(loadPath);
  console.log(`Model loaded from ${filePath}`);
  return model;
}
```

---

## Model Evaluation

### Evaluation Metrics

```typescript
/**
 * Evaluation metrics for classification model
 */
export interface EvaluationMetrics {
  /** Overall accuracy */
  accuracy: number;
  
  /** Precision per category */
  precision: number[];
  
  /** Recall per category */
  recall: number[];
  
  /** F1 score per category */
  f1Score: number[];
  
  /** Confusion matrix */
  confusionMatrix: number[][];
  
  /** Average precision */
  avgPrecision: number;
  
  /** Average recall */
  avgRecall: number;
  
  /** Average F1 score */
  avgF1Score: number;
}

/**
 * Evaluate model on test data
 * 
 * @param model - Trained model
 * @param testData - Test data
 * @param categories - List of categories
 * @returns Evaluation metrics
 */
export async function evaluateModel(
  model: tf.LayersModel,
  testData: ClassificationHistoryEntry[],
  categories: Category[]
): Promise<EvaluationMetrics> {
  
  // Prepare test data
  const { features, labels } = prepareTrainingData(testData, categories);
  
  // Convert to tensors
  const xTest = tf.tensor2d(features);
  const yTest = tf.tensor2d(labels);
  
  // Make predictions
  const predictions = model.predict(xTest) as tf.Tensor;
  const predData = await predictions.data();
  const trueData = await yTest.data();
  
  // Clean up tensors
  xTest.dispose();
  yTest.dispose();
  predictions.dispose();
  
  // Compute confusion matrix
  const numCategories = categories.length;
  const confusionMatrix = Array(numCategories).fill(0).map(() => Array(numCategories).fill(0));
  
  for (let i = 0; i < testData.length; i++) {
    const trueLabel = trueData.slice(i * numCategories, (i + 1) * numCategories).indexOf(1);
    const predLabel = Array.from(predData.slice(i * numCategories, (i + 1) * numCategories))
      .indexOf(Math.max(...predData.slice(i * numCategories, (i + 1) * numCategories)));
    
    confusionMatrix[trueLabel][predLabel]++;
  }
  
  // Compute metrics per category
  const precision: number[] = [];
  const recall: number[] = [];
  const f1Score: number[] = [];
  
  for (let i = 0; i < numCategories; i++) {
    const tp = confusionMatrix[i][i];
    const fp = confusionMatrix.reduce((sum, row, j) => sum + (j !== i ? row[i] : 0), 0);
    const fn = confusionMatrix[i].reduce((sum, val, j) => sum + (j !== i ? val : 0), 0);
    
    const p = tp / (tp + fp) || 0;
    const r = tp / (tp + fn) || 0;
    const f1 = 2 * (p * r) / (p + r) || 0;
    
    precision.push(p);
    recall.push(r);
    f1Score.push(f1);
  }
  
  // Compute overall accuracy
  const correct = confusionMatrix.reduce((sum, row, i) => sum + row[i], 0);
  const accuracy = correct / testData.length;
  
  // Compute averages
  const avgPrecision = precision.reduce((sum, p) => sum + p, 0) / numCategories;
  const avgRecall = recall.reduce((sum, r) => sum + r, 0) / numCategories;
  const avgF1Score = f1Score.reduce((sum, f) => sum + f, 0) / numCategories;
  
  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix,
    avgPrecision,
    avgRecall,
    avgF1Score
  };
}
```

---

## Model Storage Format

### File Structure

```
models/
├── classifier_v1.0.0/
│   ├── model.json          # Model architecture and weights metadata
│   ├── weights.bin         # Model weights (binary)
│   └── vectorizer.json     # TF-IDF vectorizer state
├── classifier_v1.1.0/
│   ├── model.json
│   ├── weights.bin
│   └── vectorizer.json
└── classifier_latest/      # Symlink to latest version
    ├── model.json
    ├── weights.bin
    └── vectorizer.json
```

---

### Model JSON Format

```json
{
  "modelTopology": {
    "class_name": "Sequential",
    "config": {
      "name": "sequential_1",
      "layers": [
        {
          "class_name": "Dense",
          "config": {
            "units": 64,
            "activation": "relu",
            "input_shape": [100]
          }
        },
        {
          "class_name": "Dropout",
          "config": {
            "rate": 0.3
          }
        },
        {
          "class_name": "Dense",
          "config": {
            "units": 32,
            "activation": "relu"
          }
        },
        {
          "class_name": "Dropout",
          "config": {
            "rate": 0.2
          }
        },
        {
          "class_name": "Dense",
          "config": {
            "units": 10,
            "activation": "softmax"
          }
        }
      ]
    }
  },
  "weightsManifest": [
    {
      "paths": ["weights.bin"],
      "weights": [...]
    }
  ]
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Batch Prediction**: Process multiple transactions in batches
2. **Model Caching**: Keep model in memory after loading
3. **Feature Caching**: Cache TF-IDF vectorizer
4. **Incremental Training**: Update model with new data without full retraining

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Training Time | < 30 seconds | For 100-500 samples |
| Prediction Time | < 100ms | Per transaction |
| Model Size | < 5MB | Compressed model file |
| Memory Usage | < 100MB | During prediction |
| Accuracy | > 80% | After 100+ training samples |

---

## Notes

- **Framework**: TensorFlow.js for JavaScript/TypeScript compatibility
- **Model Type**: Sequential neural network with dropout regularization
- **Features**: TF-IDF vectors from transaction text fields
- **Training**: Supervised learning with classification history
- **Evaluation**: Accuracy, precision, recall, F1 score
- **Storage**: JSON format for model architecture, binary for weights
- **Incremental Learning**: Model can be retrained with new data
