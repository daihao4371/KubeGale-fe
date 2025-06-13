import service from '@/utils/request'

export interface ClusterParams {
  page?: number;
  pageSize?: number;
  startCreatedAt?: Date;
  endCreatedAt?: Date;
  name?: string;
  [key: string]: unknown;
}

export interface ClusterData {
  id: string;
  name: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface IdParams {
  id: string;
}

export interface IdsParams {
  IDs: string[];
}

export const getClustersList = (params: ClusterParams) => {
  return service({
    url: '/kubernetes/clusterList',
    method: 'get',
    params
  })
}

export const getClustersById = (data: IdParams) => {
  return service({
    url: '/kubernetes/clusterById',
    method: 'post',
    data
  })
}

export const CreateCluster = (data: ClusterData) => {
  return service({
    url: '/kubernetes/cluster',
    method: 'post',
    data
  })
}

export const UpdateCluster = (data: ClusterData) => {
  return service({
    url: '/kubernetes/cluster',
    method: 'put',
    data
  })
}

export const DeleteCluster = (data: IdParams) => {
  return service({
    url: '/kubernetes/cluster',
    method: 'delete',
    data
  })
}

export const DeleteClusterByIds = (data: IdsParams) => {
  return service({
    url: '/kubernetes/clusterByIds',
    method: 'delete',
    data
  })
}

export const CreateCredential = (data: ClusterData) => {
  return service({
    url: '/kubernetes/credential',
    method: 'post',
    data
  })
}

export const getUserById = (data: IdParams) => {
  return service({
    url: '/kubernetes/getUserById',
    method: 'post',
    data
  })
}

export const getClusterRoles = (data: IdParams) => {
  return service({
    url: '/kubernetes/getClusterRoles',
    method: 'post',
    data
  })
}

export const getClusterApiGroups = (data: IdParams) => {
  return service({
    url: '/kubernetes/getClusterApiGroups',
    method: 'post',
    data
  })
}

export const createClusterRole = (data: ClusterData) => {
  return service({
    url: '/kubernetes/createClusterRole',
    method: 'post',
    data
  })
}

export const updateClusterRole = (data: ClusterData) => {
  return service({
    url: '/kubernetes/updateClusterRole',
    method: 'put',
    data
  })
}

export const deleteClusterRole = (data: IdParams) => {
  return service({
    url: '/kubernetes/deleteClusterRole',
    method: 'delete',
    data
  })
}

export const createClusterUser = (data: ClusterData) => {
  return service({
    url: '/kubernetes/createClusterUser',
    method: 'post',
    data
  })
}

export const updateClusterUser = (data: ClusterData) => {
  return service({
    url: '/kubernetes/updateClusterUser',
    method: 'put',
    data
  })
}

export const deleteClusterUser = (data: IdParams) => {
  return service({
    url: '/kubernetes/deleteClusterUser',
    method: 'delete',
    data
  })
}

export const getClusterUserNamespace = (data: IdParams) => {
  return service({
    url: '/kubernetes/getClusterUserNamespace',
    method: 'post',
    data
  })
}

export const getClusterListNamespace = (data: IdParams) => {
  return service({
    url: `/kubernetes/getClusterListNamespace`,
    method: 'post',
    data
  })
}
