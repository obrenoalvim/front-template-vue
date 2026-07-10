<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { api } from '@/lib/api-client'
import { usePageSeo } from '@/composables/use-page-seo'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { User } from '@/stores/auth'

const { t } = useI18n()
usePageSeo({ title: t('admin.title'), description: t('admin.title') })

const { data: users, isLoading } = useQuery({
  queryKey: ['admin', 'users'],
  queryFn: () => api.get<{ users: User[] }>('/api/admin/users').then((res) => res.users),
})
</script>

<template>
  <div class="flex w-full max-w-2xl flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('admin.title') }}</CardTitle>
      </CardHeader>
      <CardContent v-if="!isLoading && users">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left">
              <th class="py-2 font-medium">{{ t('admin.email') }}</th>
              <th class="py-2 font-medium">{{ t('admin.role') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b last:border-0">
              <td class="py-2">{{ user.email }}</td>
              <td class="py-2">{{ user.role }}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
</template>
