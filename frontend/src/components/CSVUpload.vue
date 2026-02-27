<template>
  <div class="csv-upload">
    <h2>Upload CSV</h2>

    <div class="upload-area">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
        accept=".csv"
        id="csv-file"
      />
      <label for="csv-file" class="upload-label">
        <span v-if="!selectedFile">Choose CSV file or drag here</span>
        <span v-else>{{ selectedFile.name }}</span>
      </label>

      <button @click="uploadFile" :disabled="!selectedFile || uploading" class="upload-btn">
        {{ uploading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>

    <div v-if="result" class="result">
      <h3 :class="result.success ? 'success' : 'error'">
        {{ result.message }}
      </h3>

      <div class="result-stats">
        <p>Imported: <strong>{{ result.importedCount }}</strong></p>
        <p>Duplicates: <strong>{{ result.duplicateCount }}</strong></p>
        <p>Errors: <strong>{{ result.errorCount }}</strong></p>
      </div>

      <div v-if="result.errors.length > 0" class="errors">
        <h4>Errors:</h4>
        <ul>
          <li v-for="error in result.errors" :key="error.row">
            Row {{ error.row }}: {{ error.message }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const UPLOAD_CSV = gql`
  mutation UploadCSV($input: CSVUploadInput!) {
    uploadCSV(input: $input) {
      importedCount
      duplicateCount
      errorCount
      success
      message
      errors {
        row
        message
        field
      }
    }
  }
`;

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const result = ref<any>(null);

const { mutate: uploadCSV, loading: uploading } = useMutation(UPLOAD_CSV);

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    result.value = null;
  }
}

async function uploadFile() {
  if (!selectedFile.value) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const content = e.target?.result as string;
    const base64Content = btoa(content);

    try {
      const response = await uploadCSV({
        input: {
          fileContent: base64Content,
          filename: selectedFile.value!.name,
          skipDuplicates: true
        }
      });

      result.value = response?.data?.uploadCSV;
    } catch (error: any) {
      result.value = {
        success: false,
        message: error.message,
        importedCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: error.message }]
      };
    }
  };

  reader.readAsText(selectedFile.value);
}
</script>

<style scoped>
.csv-upload {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

.upload-area {
  margin: 2rem 0;
  text-align: center;
}

input[type="file"] {
  display: none;
}

.upload-label {
  display: block;
  padding: 3rem;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.upload-label:hover {
  border-color: #4CAF50;
  background: #f9f9f9;
}

.upload-btn {
  padding: 0.75rem 2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.upload-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f9f9f9;
}

.result h3.success {
  color: #4CAF50;
}

.result h3.error {
  color: #F44336;
}

.result-stats {
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
}

.errors {
  margin-top: 1rem;
}

.errors ul {
  max-height: 200px;
  overflow-y: auto;
}
</style>
