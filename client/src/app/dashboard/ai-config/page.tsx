'use client';

import BotConfigForm from '@/components/ai-config/BotConfigForm';
import PageHeader from '@/components/ui/PageHeader';
import { MotionPage } from '@/components/ui/motion';
import { Settings } from 'lucide-react';

export default function AIConfigPage() {
  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={Settings}
        title="AI settings"
        description="Customize your bot's personality, welcome message, and escalation rules."
      />
      <BotConfigForm />
    </MotionPage>
  );
}
