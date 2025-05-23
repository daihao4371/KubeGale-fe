import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getHostList } from '@/api/cmdb/host'; // Adjusted path
import { executeBatchCommands, type ExecuteRequest, type ExecuteResponse, type HostExecResult } from '@/api/cmdb/batchOperations'; // Adjusted path
import type { Host } from '@/types/cmdb'; // Use Host type from global types

// Define types (can be moved to a types file later)
// Host interface is now imported from '@/types/cmdb'
// ExecuteRequest, ExecuteResponse, HostExecResult are imported from batchOperations API file

export default function useExecuteCommands() {
  const loadingHosts = ref(false);
  const hosts = ref<Host[]>([]); // Use imported Host type
  const selectedHosts = ref<Host[]>([]); // For table selection, also uses imported Host type
  const hostPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });

  const commandLanguage = ref('shell'); // 'shell' or 'python'
  const commandsInput = ref('');

  const executing = ref(false);
  const executionResult = ref<ExecuteResponse | null>(null);

  const fetchHosts = async () => {
    loadingHosts.value = true;
    try {
      const response = await getHostList({
        page: hostPagination.currentPage,
        pageSize: hostPagination.pageSize,
        // Add other filters like name/ip if your getHostList API supports them
        // and if you add corresponding fields to a search form for hosts.
      });
      if (response.code === 0 && response.data) {
        hosts.value = response.data.list || [];
        hostPagination.total = response.data.total || 0;
      } else {
        ElMessage.error(response.msg || '获取主机列表失败');
        hosts.value = [];
        hostPagination.total = 0;
      }
    } catch (error) {
      console.error('获取主机列表失败:', error);
      ElMessage.error('获取主机列表失败');
      hosts.value = [];
      hostPagination.total = 0;
    } finally {
      loadingHosts.value = false;
    }
  };

  const handleHostSelectionChange = (selection: Host[]) => {
    selectedHosts.value = selection;
  };
  
  const handleExecute = async () => {
    if (selectedHosts.value.length === 0) {
      ElMessage.warning('请至少选择一台主机');
      return;
    }
    if (!commandsInput.value.trim()) {
      ElMessage.warning('请输入要执行的命令');
      return;
    }
    executing.value = true;
    executionResult.value = null; // Clear previous results
    
    const requestPayload: ExecuteRequest = {
      // Assuming backend expects serverHost (primary IP) or publicIP/privateIP.
      // The Host type from @/types/cmdb includes serverHost, publicIP, privateIP.
      // Prioritize serverHost, then publicIP, then privateIP.
      hosts: selectedHosts.value.map(h => h.serverHost || h.publicIP || h.privateIP).filter(ip => !!ip), // Ensure only valid IPs are sent
      commands: commandsInput.value.trim().split('\n').filter(cmd => cmd.trim() !== ''), // Filter out empty lines
      language: commandLanguage.value,
      userId: 1, // Placeholder: Replace with actual user ID from a store or context
      users: [], // Optional: Not currently in UI
      ports: [],   // Optional: Not currently in UI
    };

    if (requestPayload.hosts.length === 0) {
       ElMessage.warning('选择的主机缺少有效的IP地址 (serverHost, publicIP, or privateIP)');
       executing.value = false;
       return;
    }

    try {
      const response = await executeBatchCommands(requestPayload);
      if (response.code === 0 && response.data) {
        executionResult.value = response.data;
        ElMessage.success(`命令执行完成: ${response.data.status}`);
      } else {
        ElMessage.error(response.msg || '命令执行失败');
        // Optionally, create a mock failure response for UI consistency
        executionResult.value = {
          allHosts: requestPayload.hosts,
          successHosts: [],
          failureHosts: requestPayload.hosts,
          executionLogs: requestPayload.hosts.map(h => ({
            host: h,
            output: '',
            error: response.msg || 'API Error: Failed to execute commands on this host.'
          })),
          status: 'Failed'
        };
      }
    } catch (error) {
      console.error('命令执行异常:', error);
      ElMessage.error('命令执行请求异常');
      executionResult.value = { // Mock failure for catch block
        allHosts: requestPayload.hosts,
        successHosts: [],
        failureHosts: requestPayload.hosts,
        executionLogs: requestPayload.hosts.map(h => ({
          host: h,
          output: '',
          error: 'Network or client-side error occurred.'
        })),
        status: 'Failed'
      };
    } finally {
      executing.value = false;
    }
  };

  return {
    loadingHosts, hosts, selectedHosts, hostPagination,
    commandLanguage, commandsInput,
    executing, executionResult,
    fetchHosts, handleHostSelectionChange, handleExecute
  };
}
