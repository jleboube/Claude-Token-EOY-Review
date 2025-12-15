/**
 * Claude Local Data Parser
 *
 * Parses Claude conversation files from the local ~/.claude/ directory
 * using the File System Access API.
 */

// Type declarations for File System Access API
interface FileSystemHandleBase {
  kind: 'file' | 'directory'
  name: string
}

interface FSFileHandle extends FileSystemHandleBase {
  kind: 'file'
  getFile(): Promise<File>
}

interface FSDirHandle extends FileSystemHandleBase {
  kind: 'directory'
  values(): AsyncIterable<FSFileHandle | FSDirHandle>
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite'
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
    }) => Promise<FSDirHandle>
  }
}

import type { UsageData, ModelUsage, MonthlyUsage } from '@/types'

// Model pricing (per million tokens) - 2025 rates
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
  'claude-opus-4-20250514': { input: 15.00, output: 75.00 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-5-sonnet-20240620': { input: 3.00, output: 15.00 },
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
}

interface ConversationMessage {
  type?: string
  message?: {
    model?: string
    usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
  }
  timestamp?: string
}

interface ParsedUsage {
  model: string
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  timestamp: Date
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

/**
 * Prompt user to select Claude data directory
 */
export async function selectClaudeDirectory(): Promise<FSDirHandle> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser. Please use Chrome or Edge.')
  }

  try {
    const dirHandle = await window.showDirectoryPicker!({
      mode: 'read',
    })
    return dirHandle
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Directory selection was cancelled')
    }
    throw error
  }
}

/**
 * Recursively find all JSONL files in a directory
 */
async function findJsonlFiles(
  dirHandle: FSDirHandle,
  files: FSFileHandle[] = [],
  depth: number = 0
): Promise<FSFileHandle[]> {
  // Limit depth to avoid infinite recursion
  if (depth > 10) return files

  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.jsonl')) {
        files.push(entry as FSFileHandle)
      } else if (entry.kind === 'directory') {
        // Skip certain directories
        if (['node_modules', '.git', 'statsig'].includes(entry.name)) continue
        await findJsonlFiles(entry as FSDirHandle, files, depth + 1)
      }
    }
  } catch (error) {
    console.warn(`Could not read directory: ${error}`)
  }

  return files
}

/**
 * Parse a single JSONL file and extract usage data
 */
async function parseJsonlFile(fileHandle: FSFileHandle): Promise<ParsedUsage[]> {
  const usages: ParsedUsage[] = []

  try {
    const file = await fileHandle.getFile()
    const content = await file.text()
    const lines = content.trim().split('\n').filter(line => line.trim())

    for (const line of lines) {
      try {
        const data: ConversationMessage = JSON.parse(line)

        // Look for assistant messages with usage data
        if (data.message?.usage) {
          const usage = data.message.usage
          const model = data.message.model || 'unknown'

          // Extract timestamp from the data or use file modified time
          let timestamp = new Date()
          if (data.timestamp) {
            timestamp = new Date(data.timestamp)
          }

          usages.push({
            model,
            inputTokens: usage.input_tokens || 0,
            outputTokens: usage.output_tokens || 0,
            cacheCreationTokens: usage.cache_creation_input_tokens || 0,
            cacheReadTokens: usage.cache_read_input_tokens || 0,
            timestamp,
          })
        }
      } catch {
        // Skip invalid JSON lines
        continue
      }
    }
  } catch (error) {
    console.warn(`Could not parse file ${fileHandle.name}: ${error}`)
  }

  return usages
}

/**
 * Calculate cost for a given model and token count
 */
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Find matching pricing (handle model name variations)
  let pricing = MODEL_PRICING[model]

  if (!pricing) {
    // Try to match by model family
    for (const [key, value] of Object.entries(MODEL_PRICING)) {
      if (model.includes(key.split('-').slice(0, 3).join('-'))) {
        pricing = value
        break
      }
    }
  }

  // Default to Sonnet pricing if unknown
  if (!pricing) {
    pricing = { input: 3.00, output: 15.00 }
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output

  return inputCost + outputCost
}

/**
 * Filter usage data to only include 2025
 */
function filterTo2025(usages: ParsedUsage[]): ParsedUsage[] {
  return usages.filter(u => u.timestamp.getFullYear() === 2025)
}

/**
 * Aggregate usage data into the format expected by the dashboard
 */
function aggregateUsageData(usages: ParsedUsage[]): UsageData {
  // Filter to 2025 only
  const filtered = filterTo2025(usages)

  // Calculate totals
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalCost = 0

  // Model breakdown
  const modelMap = new Map<string, ModelUsage>()

  // Monthly breakdown
  const monthlyMap = new Map<string, MonthlyUsage>()

  for (const usage of filtered) {
    const inputTokens = usage.inputTokens + usage.cacheCreationTokens + usage.cacheReadTokens
    const outputTokens = usage.outputTokens
    const cost = calculateCost(usage.model, inputTokens, outputTokens)

    totalInputTokens += inputTokens
    totalOutputTokens += outputTokens
    totalCost += cost

    // Update model breakdown
    const existingModel = modelMap.get(usage.model)
    if (existingModel) {
      existingModel.inputTokens += inputTokens
      existingModel.outputTokens += outputTokens
      existingModel.totalTokens += inputTokens + outputTokens
      existingModel.cost += cost
    } else {
      modelMap.set(usage.model, {
        model: usage.model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost,
      })
    }

    // Update monthly breakdown
    const monthKey = `${usage.timestamp.getFullYear()}-${String(usage.timestamp.getMonth() + 1).padStart(2, '0')}`
    const existingMonth = monthlyMap.get(monthKey)
    if (existingMonth) {
      existingMonth.inputTokens += inputTokens
      existingMonth.outputTokens += outputTokens
      existingMonth.totalTokens += inputTokens + outputTokens
      existingMonth.cost += cost
    } else {
      monthlyMap.set(monthKey, {
        month: monthKey,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost,
      })
    }
  }

  // Sort model breakdown by total tokens (descending)
  const modelBreakdown = Array.from(modelMap.values())
    .sort((a, b) => b.totalTokens - a.totalTokens)

  // Sort monthly breakdown by month
  const monthlyBreakdown = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))

  return {
    provider: 'claude' as const,
    dataSource: 'local-files' as const,
    dataSourceLabel: 'Claude Code (Local Files)',
    year: 2025,
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    totalCost,
    modelBreakdown,
    monthlyBreakdown,
  }
}

/**
 * Main function to parse Claude local data
 */
export async function parseClaudeLocalData(
  dirHandle: FSDirHandle,
  onProgress?: (message: string) => void
): Promise<UsageData> {
  onProgress?.('Scanning for conversation files...')

  const jsonlFiles = await findJsonlFiles(dirHandle)

  if (jsonlFiles.length === 0) {
    throw new Error('No conversation files found. Make sure you selected the correct Claude data directory (~/.claude or a project\'s .claude folder).')
  }

  onProgress?.(`Found ${jsonlFiles.length} conversation files. Parsing...`)

  const allUsages: ParsedUsage[] = []
  let processed = 0

  for (const fileHandle of jsonlFiles) {
    const usages = await parseJsonlFile(fileHandle)
    allUsages.push(...usages)
    processed++

    if (processed % 10 === 0) {
      onProgress?.(`Parsed ${processed}/${jsonlFiles.length} files...`)
    }
  }

  onProgress?.('Aggregating usage data...')

  const usageData = aggregateUsageData(allUsages)

  if (usageData.totalTokens === 0) {
    throw new Error('No token usage found for 2025. Make sure you have Claude conversation data from 2025.')
  }

  return usageData
}
