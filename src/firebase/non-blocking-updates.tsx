
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  collection,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

export type UserContext = {
  email: string | null;
  uid: string;
};

function logAction(docRef: DocumentReference | CollectionReference, action: string, performedBy?: UserContext, details?: string) {
  if (!performedBy?.email) return;
  
  const logsRef = collection(docRef.firestore, "system_logs");
  addDoc(logsRef, {
    timestamp: new Date().toISOString(),
    user: performedBy.email,
    action,
    target: docRef.path,
    details: details || `Performed ${action} on ${docRef.path}`
  }).catch(() => {
    // Fail silently for logs to avoid infinite loop or blocking UX
  });
}

/**
 * Initiates a setDoc operation for a document reference.
 * Records a log if performedBy context is provided.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions, performedBy?: UserContext) {
  setDoc(docRef, data, options)
    .then(() => logAction(docRef, "SET", performedBy, `Set data for document: ${docRef.id}`))
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        })
      )
    })
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Records a log if performedBy context is provided.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any, performedBy?: UserContext) {
  const promise = addDoc(colRef, data)
    .then((docRef) => {
      logAction(colRef, "CREATE", performedBy, `Added new record to ${colRef.id} (${docRef.id})`);
      return docRef;
    })
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
      throw error;
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Records a log if performedBy context is provided.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any, performedBy?: UserContext) {
  updateDoc(docRef, data)
    .then(() => logAction(docRef, "UPDATE", performedBy, `Modified document: ${docRef.id}`))
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Records a log if performedBy context is provided.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference, performedBy?: UserContext) {
  deleteDoc(docRef)
    .then(() => logAction(docRef, "DELETE", performedBy, `Removed document: ${docRef.id}`))
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
