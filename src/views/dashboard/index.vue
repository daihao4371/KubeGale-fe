<template>
  <div class="dashboard-container">
    <!-- CMDB Asset Overview Section -->
    <el-card shadow="never" class="overview-card" v-loading="loading">
      <template #header>
        <div class="card-header-title">CMDB 资产概览</div>
      </template>

      <!-- Total Summary Cards -->
      <el-row :gutter="20" class="summary-cards-row">
        <!-- "总主机数" card removed/commented out -->
        <!--
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <el-icon class="card-icon icon-host"><Monitor /></el-icon>
              <div class="card-details">
                <h3>总主机数</h3>
                <p>N/A</p> 
              </div>
            </div>
          </el-card>
        </el-col>
        -->
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <el-icon class="card-icon icon-cloud-server"><Cloudy /></el-icon>
              <div class="card-details">
                <h3>总云服务器数</h3>
                <p>{{ totalStats.cloudServers.toLocaleString() }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <el-icon class="card-icon icon-database"><Coin /></el-icon>
              <div class="card-details">
                <h3>总云数据库数</h3>
                <p>{{ totalStats.cloudDatabases.toLocaleString() }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
         <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <el-icon class="card-icon"><Operation /></el-icon> {/* Using Operation icon for LBs */ }
              <div class="card-details">
                <h3>总负载均衡数</h3>
                <p>{{ totalStats.cloudLoadBalancers.toLocaleString() }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <!-- "总项目数" card removed/commented out -->
        <!-- 
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <el-icon class="card-icon icon-project"><Folder /></el-icon>
              <div class="card-details">
                <h3>总项目数</h3>
                <p>N/A</p>
              </div>
            </div>
          </el-card>
        </el-col>
        -->
        <!-- Example for totalStats.cloudLoadBalancers if added to summary cards -->
        <!-- 
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="summary-card">
            <div class="card-content">
              <el-icon class="card-icon"><Operation /></el-icon>
              <div class="card-details">
                <h3>总负载均衡数</h3>
                <p>{{ totalStats.cloudLoadBalancers.toLocaleString() }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        -->
      </el-row>

      <el-divider />

      <!-- Per Provider Statistics Section -->
      <h3 class="sub-section-title">按云厂商统计资产</h3>
      <el-row :gutter="20" class="provider-stats-row">
        <el-col v-for="provider in perProviderStats" :key="provider.provider_id" :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="provider-card">
            <div class="provider-card-header">
              <img :src="provider.icon" :alt="provider.provider_name" class="provider-icon-img" />
              <span class="provider-name">{{ provider.provider_name }}</span>
            </div>
            <div class="provider-asset-counts">
              <div class="asset-count-item">
                <span>虚拟机:</span>
                <strong>{{ provider.vms.toLocaleString() }}</strong>
              </div>
              <div class="asset-count-item">
                <span>RDS:</span>
                <strong>{{ provider.rds.toLocaleString() }}</strong>
              </div>
              <div class="asset-count-item">
                <span>负载均衡:</span>
                <strong>{{ provider.lbs.toLocaleString() }}</strong>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col v-if="perProviderStats.length === 0 && !loading" :span="24">
          <el-empty description="暂无云厂商资产数据" />
        </el-col>
      </el-row>
    </el-card>

    <!-- Other Sections (Resource Distribution, Recent Activity) -->
    <el-row :gutter="20" class="main-content-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" class="main-card">
          <template #header>
            <div class="card-header-title">资源分布</div>
          </template>
          <div class="chart-placeholder">
            <el-row :gutter="20" style="align-items: center; justify-content: space-around; height: 100%;">
              <el-col :xs="24" :sm="8" class="progress-item">
                <el-progress type="circle" :percentage="75" status="success">
                  <span class="progress-text">CPU<br/>75%</span>
                </el-progress>
                <div class="progress-label">计算资源</div>
              </el-col>
              <el-col :xs="24" :sm="8" class="progress-item">
                <el-progress type="circle" :percentage="60" color="#e6a23c"> <!-- Warning color -->
                   <span class="progress-text">内存<br/>60%</span>
                </el-progress>
                <div class="progress-label">内存资源</div>
              </el-col>
              <el-col :xs="24" :sm="8" class="progress-item">
                <el-progress type="circle" :percentage="45" status="exception"> <!-- Danger color -->
                   <span class="progress-text">存储<br/>45%</span>
                </el-progress>
                <div class="progress-label">存储资源</div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="main-card">
          <template #header>
            <div class="card-header-title">最近活动</div>
          </template>
          <ul class="activity-list">
            <li>
              <div class="activity-item-content">
                <p class="activity-description">用户 'admin' 添加了主机 'srv-101'</p>
                <p class="activity-time">5分钟前</p>
              </div>
            </li>
            <li>
              <div class="activity-item-content">
                <p class="activity-description">云服务器 'vm-abc' 状态更新为 '运行中'</p>
                <p class="activity-time">1小时前</p>
              </div>
            </li>
            <li>
              <div class="activity-item-content">
                <p class="activity-description">项目 'Alpha Platform' 创建了新的备份</p>
                <p class="activity-time">3小时前</p>
              </div>
            </li>
            <li>
              <div class="activity-item-content">
                <p class="activity-description">数据库 'prod-db-01' 完成了例行维护</p>
                <p class="activity-time">昨天</p>
              </div>
            </li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Monitor, Cloudy, Coin, Folder, Operation } from '@element-plus/icons-vue'; // Added Operation for LBs example
import useDashboard from './useDashboard';

defineOptions({
  name: 'DashboardView'
});

const {
  loading,
  totalStats,
  perProviderStats,
  fetchDashboardStats,
} = useDashboard();

onMounted(() => {
  fetchDashboardStats();
});

// Mock data has been removed from here, now sourced from useDashboard.ts
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 50px); /* Adjust if needed */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.overview-card {
  margin-bottom: 24px; /* Space below the CMDB overview card */
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.summary-cards-row {
  margin-bottom: 20px; /* Space below total summary cards before divider */
}
.summary-cards-row .el-col {
  margin-bottom: 20px; 
}
@media (min-width: 768px) { 
  .summary-cards-row .el-col {
    margin-bottom: 0; /* No bottom margin for side-by-side cards on larger screens */
  }
}

.summary-card {
  border-radius: 8px;
  transition: box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out;
}

.summary-card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.1) !important;
  transform: translateY(-3px);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 16px; /* Adjusted padding for better spacing */
}

.card-icon {
  font-size: 40px; 
  margin-right: 16px;
  padding: 10px;
  border-radius: 6px;
  color: #fff;
  display: flex; /* Center icon if it's not perfectly square */
  align-items: center;
  justify-content: center;
}

/* Specific icon background colors */
.icon-host { background-color: #409EFF; } /* Element Blue */
.icon-cloud-server { background-color: #67C23A; } /* Success Green */
.icon-database { background-color: #E6A23C; } /* Warning Orange */
.icon-project { background-color: #909399; } /* Info Gray - or choose another like #F56C6C (Danger Red) */
.card-icon.el-icon--operation { background-color: #722ED1; } /* Purple for Load Balancers - specific to Operation icon if used */

.card-details h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #5a5e66; /* Slightly darker for better contrast */
  font-weight: 500;
}

.card-details p {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  color: #303133; 
}

.sub-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-top: 10px; /* Adjusted from 20px after el-divider */
  margin-bottom: 16px;
}

.provider-stats-row .el-col {
  margin-bottom: 20px;
}

.provider-card {
  border-radius: 6px;
  transition: box-shadow 0.3s ease;
}
.provider-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important;
}

.provider-card-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.provider-icon-img {
  width: 28px; /* Adjust size as needed */
  height: 28px;
  margin-right: 12px;
  border-radius: 4px; /* Optional: if icons have backgrounds */
}

.provider-name {
  font-size: 16px;
  font-weight: 500;
  color: #343a40;
}

.provider-asset-counts {
  font-size: 14px;
}

.asset-count-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: #5a5e66;
}
.asset-count-item strong {
  color: #303133;
  font-weight: 600;
}


/* Styles for other sections like Charts and Activity Feed remain largely the same */
.main-content-row {
  /* margin-top: 24px; /* This will be applied if overview-card has margin-bottom */
}

.main-card {
  border-radius: 8px;
  height: 100%; 
  border: 1px solid #e4e7ed; 
}

.card-header-title { /* This class is used by overview-card and main-card */
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.chart-placeholder {
  height: 360px; /* Adjusted height for better visual balance */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  /* background-color: #f9fafc; Optional background for chart area */
}

.progress-item {
  text-align: center;
  margin-bottom: 10px; /* Space for stacked items on mobile */
}

.progress-text {
  font-size: 13px; /* Clearer text inside progress */
  line-height: 1.3;
  color: #606266;
}

/* Custom styling for text within el-progress if default is overridden by element-plus */
.el-progress--circle .el-progress__text {
  font-size: 13px !important; 
  color: #606266 !important;
  line-height: 1.3 !important;
}

.progress-label {
  margin-top: 10px;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 320px; /* Set max height for scrollability if content overflows */
  overflow-y: auto;
}

.activity-list li {
  padding: 10px 4px; /* Vertical padding, minimal horizontal */
  border-bottom: 1px solid #f0f2f5; /* Lighter border */
  transition: background-color 0.2s ease;
}

.activity-list li:hover {
  background-color: #f8f9fa;
}

.activity-list li:last-child {
  border-bottom: none;
}

.activity-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-description {
  margin: 0;
  color: #495057;
  font-size: 14px;
  flex-grow: 1;
  line-height: 1.4;
}

.activity-time {
  margin: 0;
  color: #a8abb2; /* Lighter gray for time */
  font-size: 12px;
  white-space: nowrap;
  margin-left: 16px;
}

/* Responsive adjustments */
@media (max-width: 1199px) and (min-width: 992px) { /* lg but not xl */
   .chart-placeholder {
    height: 340px;
  }
   .activity-list {
    max-height: 300px;
  }
}

@media (max-width: 991px) { /* md and below (tablets and mobile) */
  .main-content-row .el-col:not(:last-child) {
     margin-bottom: 20px; /* Stack chart and activity feed */
  }
  .chart-placeholder {
    height: auto; /* Auto height for progress items */
    flex-direction: column; /* Stack progress items if needed */
  }
  .progress-item:not(:last-child) {
    margin-bottom: 20px; /* Space between stacked progress items */
  }
   .activity-list {
    max-height: none; /* No fixed height for activity list */
  }
}

@media (max-width: 767px) { /* sm and below (mobile) */
  .summary-cards-row .el-col:not(:last-child) {
     margin-bottom: 20px; /* Ensure spacing for stacked cards */
  }
  .card-icon {
    font-size: 32px;
    margin-right: 12px;
    padding: 8px;
  }
  .card-details h3 {
    font-size: 13px;
  }
  .card-details p {
    font-size: 20px;
  }
  .progress-text {
    font-size: 12px;
  }
  .el-progress--circle .el-progress__text {
    font-size: 12px !important;
  }
}
</style>