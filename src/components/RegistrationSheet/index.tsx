import { View, Text, Textarea, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import type { RegistrationType } from '@/types/models'
import './index.scss'

interface Props {
  visible: boolean
  type: RegistrationType
  onClose: () => void
  onSubmit: (data: { program?: string; bio?: string }) => Promise<void>
}

export default function RegistrationSheet({ visible, type, onClose, onSubmit }: Props) {
  const [program, setProgram] = useState('')
  const [bio, setBio] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!visible) return null

  const handleSubmit = async () => {
    if (type === 'player' && !program.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ program: program.trim() || undefined, bio: bio.trim() || undefined })
      setProgram('')
      setBio('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='reg-sheet-mask' onClick={onClose}>
      <View className='reg-sheet' onClick={(e) => e.stopPropagation()}>
        <View className='handle' />
        <Text className='title'>
          {type === 'player' ? '报名演奏' : '报名观摩'}
        </Text>
        {type === 'player' ? (
          <>
            <Text className='label'>演奏曲目 *</Text>
            <Input
              className='input'
              placeholder='如：平沙落雁'
              value={program}
              onInput={(e) => setProgram(e.detail.value)}
            />
            <Text className='label'>个人简介</Text>
            <Textarea
              className='textarea'
              placeholder='请简述习琴经历、师承等'
              maxlength={300}
              value={bio}
              onInput={(e) => setBio(e.detail.value)}
            />
          </>
        ) : (
          <Text className='hint'>提交后由主持方审核，结果将通过通知告知。</Text>
        )}
        <View className='actions'>
          <Button className='btn-cancel' onClick={onClose}>
            取消
          </Button>
          <Button
            className='btn-confirm'
            loading={submitting}
            disabled={submitting || (type === 'player' && !program.trim())}
            onClick={handleSubmit}
          >
            提交报名
          </Button>
        </View>
      </View>
    </View>
  )
}
