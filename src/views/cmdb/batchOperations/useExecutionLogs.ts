import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  getBatchExecutionLogs, 
  type CommandExecutionLog as ApiCommandExecutionLog, // Use API defined type
  type HostExecResult, // Use API defined type
  type BatchLogListParams 
} from '@/api/cmdb/batchOperations'; // Adjusted path

// Define types (can be moved to a types file later, or use existing if compatible)
// Using ApiCommandExecutionLog for the base, and adding ParsedExecutionLogs for UI
export interface CommandExecutionLogUI extends ApiCommandExecutionLog {
  ParsedExecutionLogs?: HostExecResult[];
  // Display username can be extracted from ApiCommandExecutionLog.user object
  DisplayUsername?: string; 
}

export default function useExecutionLogs() {
  const loading = ref(false);
  const logs = ref<CommandExecutionLogUI[]>([]); // Use extended UI type
  const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });
  const filters = reactive({
    dateRange: null as [Date, Date] | null,
    userId: '', // Can be User ID or Username for filtering
    status: '',
  });

  const detailDialogVisible = ref(false);
  const currentLogDetail = ref<CommandExecutionLogUI | null>(null); // Use extended UI type

  const fetchLogs = async () => {
    loading.value = true;
    const params: BatchLogListParams = { // Use BatchLogListParams type
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      startDate: filters.dateRange ? filters.dateRange[0].toISOString().split('T')[0] : undefined, // Format to YYYY-MM-DD
      endDate: filters.dateRange ? filters.dateRange[1].toISOString().split('T')[0] : undefined,   // Format to YYYY-MM-DD
      userId: filters.userId || undefined,
      status: filters.status || undefined,
    };
    
    try {
      const response = await getBatchExecutionLogs(params);
      if (response.code === 0 && response.data) {
        logs.value = response.data.list.map(log => ({
          ...log,
          // Assuming backend returns user object with Username or NickName
          DisplayUsername: log.user?.Username || log.user?.NickName || `ID: ${log.userId}`,
          // ParsedExecutionLogs will be populated when viewing details, or here if preferred
        }));
        pagination.total = response.data.total || 0;
      } else {
        ElMessage.error(response.msg || '获取日志列表失败');
        logs.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error('获取日志列表失败:', error);
      ElMessage.error('获取日志列表失败');
      logs.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  const handleViewDetails = (log: CommandExecutionLogUI) => {
    let parsedLogs: HostExecResult[] = [];
    if (log.executionLogs && typeof log.executionLogs === 'string') { // field name is executionLogs from API
      try {
        parsedLogs = JSON.parse(log.executionLogs);
      } catch (e) {
        console.error("Failed to parse ExecutionLogs JSON:", e);
        ElMessage.error('无法解析执行日志详情');
        // Keep parsedLogs as empty array in case of error
      }
    } else if (Array.isArray(log.executionLogs)) {
      // If backend potentially returns it as an array already
      parsedLogs = log.executionLogs as HostExecResult[];
    }
    currentLogDetail.value = { ...log, ParsedExecutionLogs: parsedLogs };
    detailDialogVisible.value = true;
  };
  
  const getHostCount = (serializedHosts: string): number => {
    if (!serializedHosts) return 0;
    try {
       const arr = JSON.parse(serializedHosts);
       return Array.isArray(arr) ? arr.length : 0;
    } catch { 
      return 0; 
    }
  };

  // Helper to reset filters and fetch
  const resetAndFetch = () => {
    pagination.currentPage = 1;
    fetchLogs();
  };

  return {
    loading, logs, pagination, filters,
    detailDialogVisible, currentLogDetail,
    fetchLogs, handleViewDetails, getHostCount,
    resetAndFetch
  };
}
