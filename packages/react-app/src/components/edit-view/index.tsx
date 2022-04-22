/*
 * @Author: Kanata You 
 * @Date: 2022-04-22 20:29:33 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-22 23:32:42
 */

import React from 'react';
import styled from 'styled-components';

import Editor from '@components/editor';
import type EditorContext from '@views/context';


export interface EditViewProps {
  context: React.Context<EditorContext>;
}

const EditViewElement = styled.section({
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingBlockEnd: '2em',
});

/**
 * 编辑区域.
 */
const EditView: React.FC<EditViewProps> = React.memo(function EditView ({
  context,
}) {
  return (
    <EditViewElement>
      <Editor
        context={context}
      />
    </EditViewElement>
  );
});

export default EditView;
