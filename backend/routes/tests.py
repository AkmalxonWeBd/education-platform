from fastapi import APIRouter, Depends, HTTPException, status, Query
from database import JSONDatabase
from models.test import TestResponse, TestCreate, TestUpdate, TestResultResponse, TestResultCreate
from routes.users import get_current_user
from datetime import datetime
from typing import List, Optional

router = APIRouter(tags=["tests"])

@router.get("", response_model=List[TestResponse])
def get_tests(
    groupId: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    """Get all tests"""
    db = JSONDatabase()
    
    query = {}
    if groupId:
        query["groupId"] = groupId
    
    tests = db.find("tests", query)
    
    return [
        TestResponse(
            id=test["id"],
            title=test["title"],
            groupId=test["groupId"],
            subject=test["subject"],
            questions=test.get("questions", []),
            scheduledDate=test.get("scheduledDate"),
            status=test.get("status", "draft"),
            createdAt=test.get("createdAt")
        )
        for test in tests
    ]

@router.post("", response_model=TestResponse)
def create_test(
    test_data: TestCreate,
    current_user = Depends(get_current_user)
):
    """Create new test"""
    db = JSONDatabase()
    
    test_dict = {
        "title": test_data.title,
        "groupId": test_data.groupId,
        "subject": test_data.subject,
        "questions": [q.model_dump() for q in test_data.questions],
        "scheduledDate": test_data.scheduledDate,
        "status": "draft",
        "createdAt": datetime.utcnow().isoformat()
    }
    
    result = db.insert("tests", test_dict)
    
    return TestResponse(
        id=result["id"],
        title=test_data.title,
        groupId=test_data.groupId,
        subject=test_data.subject,
        questions=test_data.questions,
        scheduledDate=test_data.scheduledDate,
        status="draft",
        createdAt=test_dict["createdAt"]
    )

@router.put("/{test_id}", response_model=TestResponse)
def update_test(
    test_id: str,
    test_data: TestUpdate,
    current_user = Depends(get_current_user)
):
    """Update test"""
    db = JSONDatabase()
    
    test = db.find_one("tests", {"id": test_id})
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    update_data = {}
    if test_data.title:
        update_data["title"] = test_data.title
    if test_data.subject:
        update_data["subject"] = test_data.subject
    if test_data.questions:
        update_data["questions"] = [q.model_dump() for q in test_data.questions]
    if test_data.scheduledDate:
        update_data["scheduledDate"] = test_data.scheduledDate
    if test_data.status:
        update_data["status"] = test_data.status
    
    if update_data:
        db.update("tests", test_id, update_data)
    
    updated_test = db.find_one("tests", {"id": test_id})
    
    return TestResponse(
        id=updated_test["id"],
        title=updated_test["title"],
        groupId=updated_test["groupId"],
        subject=updated_test["subject"],
        questions=updated_test.get("questions", []),
        scheduledDate=updated_test.get("scheduledDate"),
        status=updated_test.get("status", "draft"),
        createdAt=updated_test.get("createdAt")
    )

@router.delete("/{test_id}")
def delete_test(
    test_id: str,
    current_user = Depends(get_current_user)
):
    """Delete test"""
    db = JSONDatabase()
    
    test = db.find_one("tests", {"id": test_id})
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    db.delete("tests", test_id)
    return {"success": True, "message": "Test deleted"}

@router.get("/results", response_model=List[TestResultResponse])
def get_test_results(
    testId: Optional[str] = Query(None),
    studentId: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    """Get test results"""
    db = JSONDatabase()
    
    query = {}
    if testId:
        query["testId"] = testId
    if studentId:
        query["studentId"] = studentId
    
    results = db.find("test_results", query)
    
    return [
        TestResultResponse(
            id=result["id"],
            testId=result["testId"],
            studentId=result["studentId"],
            score=result["score"],
            totalPoints=result["totalPoints"],
            status=result.get("status", "pending"),
            createdAt=result.get("createdAt")
        )
        for result in results
    ]

@router.post("/results", response_model=TestResultResponse)
def submit_test_result(
    result_data: TestResultCreate,
    current_user = Depends(get_current_user)
):
    """Submit test result"""
    db = JSONDatabase()
    
    result_dict = {
        "testId": result_data.testId,
        "studentId": result_data.studentId,
        "score": result_data.score,
        "totalPoints": result_data.totalPoints,
        "status": "completed",
        "createdAt": datetime.utcnow().isoformat()
    }
    
    insert_result = db.insert("test_results", result_dict)
    
    return TestResultResponse(
        id=insert_result["id"],
        testId=result_data.testId,
        studentId=result_data.studentId,
        score=result_data.score,
        totalPoints=result_data.totalPoints,
        status="completed",
        createdAt=result_dict["createdAt"]
    )
